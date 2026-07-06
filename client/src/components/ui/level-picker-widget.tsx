'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

export type LevelPickerItem = {
  value: string;
  label: string;
  desc: string;
};

type LevelPickerWidgetProps = {
  levels: LevelPickerItem[];
  value: string;
  onValueChange: (value: string) => void;
  title?: string;
  className?: string;
};

export function LevelPickerWidget({
  levels,
  value,
  onValueChange,
  title = 'Pick your level',
  className,
}: LevelPickerWidgetProps) {
  const selected = levels.find((l) => l.value === value) ?? levels[0];
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      startX.current = e.pageX - el.offsetLeft;
      scrollLeftStart.current = el.scrollLeft;
      el.style.cursor = 'grabbing';
    };

    const onMouseLeave = () => {
      isDragging.current = false;
      el.style.cursor = 'grab';
    };

    const onMouseUp = () => {
      isDragging.current = false;
      el.style.cursor = 'grab';
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      el.scrollLeft = scrollLeftStart.current - (x - startX.current);
    };

    el.style.cursor = 'grab';
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mousemove', onMouseMove);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <div
      className={cn(
        'flex w-full max-w-sm flex-col rounded-[28px] border border-black/10 bg-black/[0.02] shadow-lg select-none dark:border-white/10 dark:bg-white/[0.03]',
        className
      )}
    >
      <div className="p-4">
        <motion.div
          key={title}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="ml-2 text-lg font-semibold text-black/90 dark:text-white/90"
        >
          {title}
        </motion.div>

        <div
          ref={scrollRef}
          className="mt-3 flex gap-2 overflow-x-auto px-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {levels.map((level) => {
            const isSelected = value === level.value;
            return (
              <div key={level.value} className="flex min-w-12 flex-col items-center pt-2">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onValueChange(level.value)}
                  className="relative flex h-10 w-10 items-center justify-center"
                >
                  {isSelected && (
                    <motion.div
                      layoutId="level-picker-bg"
                      transition={{ type: 'spring', stiffness: 180, damping: 22 }}
                      className="absolute inset-0 rounded-full bg-black shadow-sm dark:bg-white"
                    />
                  )}
                  <span
                    className={cn(
                      'relative z-10 text-sm font-bold',
                      isSelected
                        ? 'text-white dark:text-black'
                        : 'text-black/70 dark:text-white/70'
                    )}
                  >
                    {level.value}
                  </span>
                </motion.button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative flex h-36 flex-col overflow-hidden rounded-[24px] border border-black/10 bg-white px-4 pt-3 dark:border-white/10 dark:bg-black">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.value}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-1 py-2"
            >
              <span className="text-base font-semibold text-black/90 dark:text-white/90">
                {selected.label}
              </span>
              <span className="text-sm text-black/50 dark:text-white/50">{selected.desc}</span>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="flex h-full flex-col items-center justify-center gap-2"
            >
              <div className="rounded-lg bg-black/5 p-4 dark:bg-white/10">
                <GraduationCap className="size-7 text-black/40 dark:text-white/40" />
              </div>
              <p className="text-sm text-black/50 dark:text-white/50">Select a level</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
