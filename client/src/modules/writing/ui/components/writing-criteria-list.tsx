import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { WritingCriterionScore } from '@/modules/writing/types/writing';

const CRITERION_LABELS: Record<string, string> = {
  content_coherence: 'Content / Coherence',
  vocabulary: 'Vocabulary',
  language_accuracy: 'Language Accuracy',
  task_fulfillment: 'Task Fulfillment',
};

export function WritingCriteriaList({
  criteria,
  compact,
}: {
  criteria: WritingCriterionScore[];
  compact?: boolean;
}) {
  return (
    <div className="space-y-4">
      {criteria.map((c) => (
        <div key={c.criterion} className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-neutral-900">
              {c.label || CRITERION_LABELS[c.criterion] || c.criterion}
            </span>
            <span className={cn('text-sm font-semibold tabular-nums', scoreColor(c.score))}>
              {c.score}/100
            </span>
          </div>
          <Progress value={c.score} className="h-2 bg-neutral-100" />
          {!compact && c.feedback && (
            <p className="text-sm leading-relaxed text-neutral-500">{c.feedback}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function scoreColor(score: number) {
  if (score >= 80) return 'text-emerald-700';
  if (score >= 60) return 'text-amber-700';
  return 'text-red-600';
}
