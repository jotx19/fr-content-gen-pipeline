import { Check, X } from 'lucide-react';
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
};

export function McqQuestion({
  question,
  selectedIndex,
  onSelect,
  disabled = false,
  showResult = false,
  correctIndex = null,
  shake = false,
}: Props) {
  const activeIndex = selectedIndex ?? null;
  const locked = disabled || showResult;

  return (
    <div className={cn('space-y-6 animate-bounce-in', shake && 'animate-shake')}>
      <div className="space-y-3 rounded-2xl bg-[#FCFCFC] px-5 py-4 dark:bg-[#1C1C1C]">
        {question.skillTag && <Badge variant="skill">{question.skillTag}</Badge>}
        <h2
          className={`${bricolage.className} text-xl font-semibold leading-snug tracking-tight md:text-2xl`}
        >
          {question.question}
        </h2>
      </div>

      <ul className="space-y-3" role="listbox" aria-label="Answer choices">
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
                  'flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left font-semibold transition-colors',
                  'border-dashed border-border/70 bg-[#FCFCFC] dark:border-white/15 dark:bg-[#1C1C1C]',
                  isSelected &&
                    !showResult &&
                    'border-solid border-primary bg-primary/5 ring-2 ring-primary/20',
                  isCorrect &&
                    'border-solid border-primary bg-primary/10 text-primary',
                  isWrong &&
                    'border-solid border-destructive bg-destructive/10 text-destructive',
                  isDimmed && 'opacity-50',
                  !locked && !isSelected && 'hover:border-foreground/20 active:opacity-90'
                )}
                onClick={() => !locked && onSelect?.(idx)}
                disabled={locked}
                role="option"
                aria-selected={isSelected}
              >
                <span
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-extrabold',
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
                      'border-dashed border-border/70 bg-transparent dark:border-white/15'
                  )}
                >
                  {isSelected && !showResult ? (
                    <Check className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
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
