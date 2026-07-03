'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type PointerEvent, type RefObject } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

/** Illustrations from https://popsy.co/illustrations (free, attribution to popsy.co) */
const CARDS = [
  {
    bg: '#6BCF55',
    src: '/landing-cards/practice.svg',
    alt: 'Studying',
    rotate: -13,
    spread: -1,
    offsetY: 8,
    depth: 1.15,
    zIndex: 1,
  },
  {
    bg: '#58B4FF',
    src: '/landing-cards/listen.svg',
    alt: 'Listening',
    rotate: -4,
    spread: -0.33,
    offsetY: -2,
    depth: 1.45,
    zIndex: 2,
  },
  {
    bg: '#B8E55A',
    src: '/landing-cards/write.svg',
    alt: 'Writing at desk',
    rotate: 4,
    spread: 0.33,
    offsetY: 2,
    depth: 1.35,
    zIndex: 3,
  },
  {
    bg: '#F7C4CB',
    src: '/landing-cards/progress.svg',
    alt: 'Success',
    rotate: 12,
    spread: 1,
    offsetY: 8,
    depth: 1.1,
    zIndex: 4,
  },
] as const;

function useCardSpread(containerRef: RefObject<HTMLDivElement | null>) {
  const [layout, setLayout] = useState({ spreadPx: 88, isMobile: true });

  useEffect(() => {
    const update = () => {
      const el = containerRef.current;
      if (!el) return;

      const containerW = el.offsetWidth;
      const vw = window.innerWidth;
      const isMobile = vw < 640;

      const cardW = isMobile ? 88 : vw < 1024 ? 160 : 176;
      const rotationPad = isMobile ? 14 : 12;
      const maxSpread = Math.max(40, (containerW - cardW) / 2 - rotationPad);

      const spreadPx = isMobile
        ? Math.min(maxSpread, Math.round(maxSpread * 0.88))
        : vw < 1024
          ? Math.min(182, maxSpread)
          : Math.min(215, maxSpread);

      setLayout({ spreadPx, isMobile });
    };

    update();

    const observer = new ResizeObserver(update);
    if (containerRef.current) observer.observe(containerRef.current);

    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [containerRef]);

  return layout;
}

export function LandingHeroCards({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { spreadPx, isMobile } = useCardSpread(ref);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setMouse({
      x: (event.clientX - rect.left) / rect.width - 0.5,
      y: (event.clientY - rect.top) / rect.height - 0.5,
    });
  };

  return (
    <div ref={ref} className={cn('mx-auto w-full max-w-[46rem] sm:max-w-[56rem] lg:max-w-[66rem]', className)}>
      <div
        className="relative mx-auto w-full overflow-x-clip overflow-y-visible pb-3 pt-1 sm:pb-4 sm:pt-2"
        style={{ minHeight: '12rem' }}
      >
        <div
          className="relative mx-auto h-[11.5rem] w-full sm:h-[15rem] lg:h-[17rem]"
          style={{ perspective: 1400 }}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setMouse({ x: 0, y: 0 })}
          aria-hidden
        >
        {CARDS.map((card) => {
          const spreadFactor =
            isMobile && Math.abs(card.spread) === 0.33 ? (card.spread > 0 ? 0.48 : -0.48) : card.spread;
          const offsetX = spreadFactor * spreadPx;

          return (
            <motion.div
              key={card.src}
              className="absolute left-1/2 top-1/2 h-[8rem] w-[5.5rem] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[0.95rem] shadow-[0_16px_40px_rgba(15,15,15,0.12),0_6px_14px_rgba(15,15,15,0.06)] sm:h-[12.5rem] sm:w-[10rem] sm:rounded-[1.25rem] sm:shadow-[0_22px_55px_rgba(15,15,15,0.14),0_8px_18px_rgba(15,15,15,0.07)] lg:h-[14rem] lg:w-[11rem] lg:rounded-[1.35rem]"
              style={{
                backgroundColor: card.bg,
                zIndex: card.zIndex,
                transformOrigin: 'center center',
              }}
              initial={false}
              animate={
                reduced
                  ? {
                      x: offsetX,
                      y: card.offsetY,
                      rotate: card.rotate,
                    }
                  : {
                      x: offsetX + mouse.x * 22 * card.depth,
                      y: card.offsetY + mouse.y * 14 * card.depth,
                      rotate: card.rotate + mouse.x * 3.5,
                      rotateX: mouse.y * -8,
                      rotateY: mouse.x * 8,
                    }
              }
              transition={{ type: 'spring', stiffness: 130, damping: 22, mass: 0.75 }}
            >
              <motion.div
                className="relative h-full w-full p-1 sm:p-2.5 lg:p-3"
                animate={
                  reduced
                    ? {}
                    : {
                        x: mouse.x * 4 * card.depth,
                        y: mouse.y * 2.5 * card.depth,
                      }
                }
                transition={{ type: 'spring', stiffness: 170, damping: 24 }}
              >
                <Image
                  src={card.src}
                  alt={card.alt}
                  fill
                  sizes="(min-width: 1024px) 176px, (min-width: 640px) 160px, 88px"
                  className="scale-[1.04] object-contain object-center sm:scale-[1.06]"
                  draggable={false}
                />
              </motion.div>
            </motion.div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
