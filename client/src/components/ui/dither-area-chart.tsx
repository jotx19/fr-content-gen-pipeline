'use client';

import { useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';

type DitherAreaChartProps = {
  values?: number[];
  className?: string;
  height?: number;
  /** 0–1 normalized highlight position on x-axis */
  markerAt?: number;
};

function buildSeries(lastScore?: number | null): number[] {
  if (lastScore != null) {
    const end = Math.min(1, Math.max(0.12, lastScore / 100));
    return [
      end * 0.35,
      end * 0.42,
      end * 0.38,
      end * 0.55,
      end * 0.62,
      end * 0.78,
      end,
    ];
  }
  return [0.14, 0.2, 0.18, 0.26, 0.32, 0.38, 0.44];
}

export function DitherAreaChart({
  values,
  className,
  height = 112,
  markerAt = 0.72,
}: DitherAreaChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const series = useMemo(() => values ?? buildSeries(), [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const dpr = window.devicePixelRatio || 1;
      const w = rect.width;
      const h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const isDark = document.documentElement.classList.contains('dark');
      const dotColor = isDark ? '#7ae02a' : '#58cc02';
      const padX = 2;
      const padY = 6;
      const stepX = (w - padX * 2) / (series.length - 1);

      const yAt = (i: number) => {
        const v = series[i];
        return h - padY - v * (h - padY * 2);
      };

      const curveYAt = (x: number) => {
        const t = Math.max(0, Math.min(1, (x - padX) / (w - padX * 2)));
        const idx = t * (series.length - 1);
        const i0 = Math.floor(idx);
        const i1 = Math.min(series.length - 1, i0 + 1);
        const frac = idx - i0;
        return yAt(i0) * (1 - frac) + yAt(i1) * frac;
      };

      const spacing = 3;
      const cols = Math.ceil(w / spacing);
      const rows = Math.ceil(h / spacing);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * spacing + spacing * 0.5;
          const y = row * spacing + spacing * 0.5;
          const curveY = curveYAt(x);

          if (y < curveY - 0.5) continue;

          const fillDepth = (y - curveY) / Math.max(1, h - curveY);
          const alpha = Math.max(0.06, 0.95 - fillDepth * 0.92);

          ctx.globalAlpha = alpha;
          ctx.fillStyle = dotColor;
          ctx.beginPath();
          ctx.arc(x, y, 0.85, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      ctx.strokeStyle = dotColor;
      ctx.lineWidth = 1.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      series.forEach((_, i) => {
        const x = padX + i * stepX;
        const y = yAt(i);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      const markerX = padX + markerAt * (w - padX * 2);
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(markerX, padY);
      ctx.lineTo(markerX, h - padY);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [series, markerAt]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('block w-full', className)}
      style={{ height }}
      aria-hidden
    />
  );
}

export function DitherAreaChartFromScore({
  lastScore,
  className,
  height,
}: {
  lastScore?: number | null;
  className?: string;
  height?: number;
}) {
  const values = useMemo(() => buildSeries(lastScore), [lastScore]);
  return (
    <DitherAreaChart values={values} className={className} height={height} />
  );
}
