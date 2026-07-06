import { Check, X } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { bricolage } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import type { PublicQuestion } from '@/modules/tef/types/tef';

type Props = {
  question: PublicQuestion;
  selectedIndex?: number | null;
  onSelect?: (idx: number) => void;
  disabled?: boolean;
  showResult?: boolean;
  correctIndex?: number | null;
  shake?: boolean;
  variant?: 'default' | 'minimal';
};

export function McqQuestion({
  question,
  selectedIndex,
  onSelect,
  disabled = false,
  showResult = false,
  correctIndex = null,
  shake = false,
  variant = 'default',
}: Props) {
  const activeIndex = selectedIndex ?? null;
  const locked = disabled || showResult;
  const minimal = variant === 'minimal';

  return (
    <div className={cn('space-y-4', !minimal && 'space-y-6 animate-bounce-in', shake && 'animate-shake')}>
      <div
        className={cn(
          minimal ? 'px-1 py-1' : 'space-y-3 rounded-2xl bg-[#FCFCFC] px-5 py-4 dark:bg-[#1C1C1C]'
        )}
      >
        {question.skillTag && !minimal && <Badge variant="skill">{question.skillTag}</Badge>}
        <h2
          className={cn(
            minimal
              ? 'text-base font-semibold leading-snug text-black/90 dark:text-white/90'
              : `${bricolage.className} text-xl font-semibold leading-snug tracking-tight md:text-2xl`
          )}
        >
          {question.question}
        </h2>
      </div>

      <ul className={cn(minimal ? 'space-y-2' : 'space-y-3')} role="listbox" aria-label="Answer choices">
        {question.options.map((opt, idx) => {
          const isSelected = activeIndex === idx;
          const isCorrect = showResult && correctIndex === idx;
          const isWrong = showResult && isSelected && correctIndex !== idx;
          const isDimmed = showResult && !isCorrect && !isWrong;

          return (
            <li key={idx}>
              <button
                type="button"
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition active:scale-[0.99]',
                  minimal &&
                    'border-black/15 text-black/90 hover:border-black/50 hover:bg-black/5 dark:border-white/15 dark:text-white/90 dark:hover:border-white/50 dark:hover:bg-white/10',
                  minimal &&
                    isSelected &&
                    !showResult &&
                    'border-black bg-black/10 dark:border-white dark:bg-white/10',
                  !minimal &&
                    'gap-4 rounded-2xl border-dashed border-border/70 bg-[#FCFCFC] py-4 font-semibold dark:border-white/15 dark:bg-[#1C1C1C]',
                  !minimal &&
                    isSelected &&
                    !showResult &&
                    'border-solid border-primary bg-primary/5 ring-2 ring-primary/20',
                  isCorrect &&
                    'border-solid border-primary bg-primary/10 text-primary',
                  isWrong &&
                    'border-solid border-destructive bg-destructive/10 text-destructive',
                  isDimmed && 'opacity-50',
                  !locked && !isSelected && !minimal && 'hover:border-foreground/20 active:opacity-90'
                )}
                onClick={() => !locked && onSelect?.(idx)}
                disabled={locked}
                role="option"
                aria-selected={isSelected}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-bold',
                    minimal && 'border-black/20 dark:border-white/20',
                    minimal &&
                      isSelected &&
                      !showResult &&
                      'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black',
                    !minimal && 'h-10 w-10 rounded-xl text-sm font-extrabold',
                    !minimal &&
                      isSelected &&
                      !showResult &&
                      'border-primary bg-primary text-primary-foreground',
                    isCorrect &&
                      'border-solid border-primary bg-primary text-primary-foreground',
                    isWrong &&
                      'border-solid border-destructive bg-destructive text-destructive-foreground',
                    !isSelected &&
                      !isCorrect &&
                      !isWrong &&
                      !minimal &&
                      'border-dashed border-border/70 bg-transparent dark:border-white/15'
                  )}
                >
                  {isSelected && !showResult ? (
                    <Check
                      className={cn('h-4 w-4', minimal && 'text-white dark:text-black')}
                      strokeWidth={2.5}
                    />
                  ) : (
                    String.fromCharCode(65 + idx)
                  )}
                </span>
                <span className="flex-1">{opt}</span>
                {showResult && isCorrect && <Check className="h-5 w-5 shrink-0" />}
                {showResult && isWrong && <X className="h-5 w-5 shrink-0" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
