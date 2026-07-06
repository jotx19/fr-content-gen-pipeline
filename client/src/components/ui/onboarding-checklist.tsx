'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronRight, ChevronUp } from 'lucide-react';
import { bricolage } from '@/lib/fonts';
import { cn } from '@/lib/utils';

export type OnboardingChecklistStep = {
  id: number;
  title: string;
  isCompleted: boolean;
};

type OnboardingChecklistProps = {
  steps: OnboardingChecklistStep[];
  title?: string;
  embedded?: boolean;
  activeStepId?: number;
  sidebar?: boolean;
};

const springConfig = { type: 'spring', stiffness: 300, damping: 30 } as const;

export function OnboardingChecklist({
  steps,
  title = 'Getting started',
  embedded = false,
  activeStepId,
  sidebar = false,
}: OnboardingChecklistProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const completedCount = steps.filter((s) => s.isCompleted).length;
  const totalSteps = steps.length;
  const fallbackActiveId = steps.find((s) => !s.isCompleted)?.id;
  const currentActiveId = activeStepId ?? fallbackActiveId;

  const stepRows = steps.map((step) => {
    const isActive = !step.isCompleted && step.id === currentActiveId;

    return (
      <div
        key={step.id}
        className={cn(
          'flex items-center gap-2.5 rounded-lg py-2 transition-colors',
          !sidebar && 'justify-between px-3 sm:px-4',
          sidebar && 'px-1',
          isActive && sidebar && 'rounded-xl bg-black/5 dark:bg-white/5',
          !sidebar &&
            'cursor-pointer hover:bg-black/5 active:scale-[0.98] dark:hover:bg-white/10 sm:active:scale-100'
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          {step.isCompleted ? (
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black dark:bg-white">
              <Check size={10} strokeWidth={4} className="text-white sm:hidden dark:text-black" />
              <Check size={12} strokeWidth={4} className="hidden text-white sm:block dark:text-black" />
            </div>
          ) : (
            <div
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                isActive
                  ? 'border border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                  : 'border border-black/20 bg-transparent text-black/40 dark:border-white/30 dark:text-white/50'
              )}
            >
              {step.id}
            </div>
          )}
          <span
            className={cn(
              'truncate text-xs font-medium sm:text-[13px]',
              step.isCompleted
                ? 'text-black/40 line-through decoration-black/30 dark:text-white/40 dark:decoration-white/30'
                : isActive
                  ? 'text-black/90 dark:text-white/90'
                  : 'text-black/60 dark:text-white/60'
            )}
          >
            {step.title}
          </span>
        </div>

        {!step.isCompleted && !sidebar && (
          <ChevronRight size={14} className="size-3.5 shrink-0 text-black/30 dark:text-white/30" />
        )}
      </div>
    );
  });

  if (sidebar) {
    return (
      <div className={cn('flex w-full flex-col justify-center', bricolage.className)}>
        <div className="space-y-1">{stepRows}</div>
      </div>
    );
  }

  return (
    <div className={cn(embedded && 'h-full', bricolage.className)}>
      <motion.div
        transition={springConfig}
        className={cn(
          'w-full overflow-hidden rounded-xl border border-black/10 bg-black/3 shadow-lg dark:border-white/10 dark:bg-white/5',
          embedded ? 'max-w-none' : 'max-w-xl'
        )}
      >
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full cursor-pointer items-center justify-between p-3 select-none sm:p-3.5"
        >
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <motion.div
              animate={{ rotate: isExpanded ? 0 : 180 }}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-black/40 sm:h-8 sm:w-8 dark:text-white/40"
            >
              <ChevronUp size={20} className="sm:hidden" />
              <ChevronUp size={22} className="hidden sm:block" />
            </motion.div>
            <span className="truncate pr-1 text-sm font-bold text-black/90 sm:text-[15px] dark:text-white/90">
              {title}
            </span>
          </div>

          <div className="ml-1 flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="flex gap-0.5">
              {Array.from({ length: 14 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-3.5 w-[2.5px] rounded-full transition-colors duration-500 sm:h-4 sm:w-[3.5px]',
                    i < (completedCount / totalSteps) * 14
                      ? 'bg-black dark:bg-white'
                      : 'bg-black/10 dark:bg-white/15'
                  )}
                />
              ))}
            </div>
            <span className="min-w-7 text-right text-xs font-bold text-black/50 sm:text-[13px] dark:text-white/50">
              {completedCount}/{totalSteps}
            </span>
          </div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={springConfig}
              className="rounded-t-4xl border-t border-black/10 bg-white sm:rounded-t-[24px] dark:border-white/10 dark:bg-black/40"
            >
              <div className="space-y-0.5 p-1.5 sm:space-y-1 sm:p-2">{stepRows}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
