import { Check, X } from 'lucide-react';
import { PublicQuestion } from '@/lib/tef-api';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Props = {
  question: PublicQuestion;
  questionNumber?: number;
  totalQuestions?: number;
  selectedIndex?: number | null;
  onSelect?: (idx: number) => void;
  disabled?: boolean;
  showResult?: boolean;
  correctIndex?: number | null;
  shake?: boolean;
};

export function McqQuestion({
  question,
  questionNumber,
  totalQuestions,
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
      <div className="space-y-3">
        {questionNumber != null && totalQuestions != null && (
          <div className="flex items-center gap-2">
            {question.skillTag && <Badge variant="skill">{question.skillTag}</Badge>}
          </div>
        )}
        <h2 className="text-xl font-extrabold leading-snug text-foreground md:text-2xl">
          {question.question}
        </h2>
      </div>

      <ul className="space-y-3" role="listbox" aria-label="Answer choices">
        {question.options.map((opt, idx) => {
          const isSelected = activeIndex === idx;
          const isCorrect = showResult && correctIndex === idx;
          const isWrong = showResult && isSelected && correctIndex !== idx;

          return (
            <li key={idx}>
              <button
                type="button"
                className={cn(
                  'flex w-full items-center gap-4 rounded-2xl border-2 px-4 py-4 text-left font-semibold transition-all',
                  'border-border bg-card shadow-[0_3px_0_0_hsl(var(--border))]',
                  isSelected && !showResult && 'border-primary bg-primary/5 shadow-[0_3px_0_0_hsl(var(--primary-shadow))]',
                  isCorrect && 'border-primary bg-primary/10 text-primary shadow-[0_3px_0_0_hsl(var(--primary-shadow))]',
                  isWrong && 'border-destructive bg-destructive/10 text-destructive shadow-[0_3px_0_0_hsl(var(--destructive-shadow))]',
                  !locked && 'hover:bg-muted/50 active:translate-y-0.5'
                )}
                onClick={() => !locked && onSelect?.(idx)}
                disabled={locked}
                role="option"
                aria-selected={isSelected}
              >
                <span
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 text-sm font-extrabold',
                    isSelected && !showResult && 'border-primary bg-primary text-primary-foreground',
                    isCorrect && 'border-primary bg-primary text-primary-foreground',
                    isWrong && 'border-destructive bg-destructive text-destructive-foreground',
                    !isSelected && !isCorrect && !isWrong && 'border-border bg-muted'
                  )}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1">{opt}</span>
                {isCorrect && <Check className="h-5 w-5 shrink-0" />}
                {isWrong && <X className="h-5 w-5 shrink-0" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
