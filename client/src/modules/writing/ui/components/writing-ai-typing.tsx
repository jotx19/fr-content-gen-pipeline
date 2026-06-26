'use client';

import { useEffect, useRef, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type WritingAiTypingProps = {
  text: string;
  loading: boolean;
  active: boolean;
  resetKey?: number;
  onProgress?: (partial: string) => void;
  onTypingDone?: () => void;
  className?: string;
};

export function WritingAiTyping({
  text,
  loading,
  active,
  resetKey = 0,
  onProgress,
  onTypingDone,
  className,
}: WritingAiTypingProps) {
  const [displayed, setDisplayed] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);
  const onProgressRef = useRef(onProgress);
  const onTypingDoneRef = useRef(onTypingDone);

  onProgressRef.current = onProgress;
  onTypingDoneRef.current = onTypingDone;

  useEffect(() => {
    if (timerRef.current !== undefined) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }

    if (!active) {
      setDisplayed('');
      setTypingDone(false);
      return;
    }

    if (loading || !text) {
      setDisplayed('');
      setTypingDone(false);
      return;
    }

    setDisplayed('');
    setTypingDone(false);

    let index = 0;
    const targetDurationMs = 1800;
    const tickMs = 14;
    const ticks = Math.max(12, Math.ceil(targetDurationMs / tickMs));
    const baseChunk = Math.max(4, Math.ceil(text.length / ticks));

    const tick = () => {
      if (index >= text.length) {
        setTypingDone(true);
        onTypingDoneRef.current?.();
        return;
      }

      const chunk = baseChunk + Math.floor(Math.random() * Math.max(2, Math.floor(baseChunk / 2)));
      index = Math.min(text.length, index + chunk);
      const partial = text.slice(0, index);
      setDisplayed(partial);
      onProgressRef.current?.(partial);

      timerRef.current = window.setTimeout(tick, tickMs + Math.random() * 8);
    };

    timerRef.current = window.setTimeout(tick, 80);

    return () => {
      if (timerRef.current !== undefined) {
        window.clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
    };
  }, [active, loading, text, resetKey]);

  if (!active) return null;

  if (loading) {
    return (
      <div className={cn('min-h-[240px] space-y-3 px-4 py-3 pr-[4.75rem]', className)}>
        <Skeleton className="h-3.5 w-[88%] rounded-md bg-foreground/8" />
        <Skeleton className="h-3.5 w-[92%] rounded-md bg-foreground/8" />
        <Skeleton className="h-3.5 w-[75%] rounded-md bg-foreground/8" />
        <Skeleton className="h-3.5 w-[85%] rounded-md bg-foreground/8" />
        <Skeleton className="h-3.5 w-[60%] rounded-md bg-foreground/8" />
      </div>
    );
  }

  if (!text) {
    return (
      <div className={cn('min-h-[240px] px-4 py-3 text-sm text-muted-foreground', className)}>
        Could not load example text.
      </div>
    );
  }

  return (
    <div
      className={cn(
        'min-h-[240px] max-h-[420px] overflow-y-auto px-4 py-3 pr-[4.75rem] text-sm leading-relaxed text-foreground',
        className
      )}
    >
      <p className="mb-3 text-xs font-medium text-muted-foreground">AI example</p>
      <div className="whitespace-pre-wrap">
        {displayed}
        {!typingDone && (
          <span
            className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[2px] animate-pulse bg-foreground/70"
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}
