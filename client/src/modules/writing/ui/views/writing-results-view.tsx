'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowUp, PenLine } from '@/components/icons';
import { bricolage } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { WritingCriteriaList } from '@/modules/writing/ui/components/writing-criteria-list';
import { useWritingStore } from '@/store/writingStore';

export function WritingResultsView() {
  const router = useRouter();
  const result = useWritingStore((s) => s.lastResult);

  useEffect(() => {
    if (!result) router.replace('/learn/writing');
  }, [result, router]);

  if (!result) return null;

  const { overallScore, criteria, suggestions, summary, adjustment, newLevel, reason, wordCount, xpGain, writingXp } =
    result;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 pb-28 pt-8 sm:px-6">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground text-background">
            <PenLine className="h-6 w-6" strokeWidth={2} />
          </span>
          <h1 className={`${bricolage.className} text-3xl font-semibold`}>Writing evaluated</h1>
          <p className="mt-3 text-5xl font-semibold tabular-nums text-foreground">{overallScore}</p>
          <p className="text-sm text-muted-foreground">out of 100 · {wordCount} words submitted</p>
          {xpGain != null && (
            <p className="mt-2 text-sm font-medium text-foreground">+{xpGain} writing XP · {writingXp ?? 0} total</p>
          )}
        </div>

        {summary && (
          <p className="mb-6 rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed text-muted-foreground">
            {summary}
          </p>
        )}

        {adjustment && (
          <div
            className={cn(
              'mb-6 flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm',
              adjustment === 'levelUp' && 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100',
              adjustment === 'levelDown' && 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100',
              adjustment === 'same' && 'border-border bg-card text-muted-foreground'
            )}
          >
            {adjustment === 'levelUp' && <ArrowUp className="mt-0.5 h-4 w-4 shrink-0" />}
            <div>
              {adjustment === 'levelUp' && <p className="font-medium">Writing level up → {newLevel}</p>}
              {adjustment === 'levelDown' && (
                <p className="font-medium">Writing level adjusted → {newLevel}</p>
              )}
              {adjustment === 'same' && <p className="font-medium">Writing level — {newLevel}</p>}
              {reason && <p className="mt-1 text-muted-foreground">{reason}</p>}
            </div>
          </div>
        )}

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className={`${bricolage.className} mb-6 text-lg font-semibold`}>Criteria breakdown</h2>
          <WritingCriteriaList criteria={criteria} />
        </section>

        {suggestions?.length > 0 && (
          <section className="mt-6 rounded-2xl border border-border bg-card p-6">
            <h2 className={`${bricolage.className} mb-4 text-lg font-semibold`}>Suggestions</h2>
            <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              {suggestions.map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="text-muted-foreground/60">·</span>
                  {s}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 p-4 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => router.push('/learn/writing')}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background hover:opacity-90"
          >
            Practice again
          </button>
          <button
            type="button"
            onClick={() => router.push('/learn')}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-border bg-card text-sm font-medium text-foreground hover:bg-muted"
          >
            Back to Learn
          </button>
        </div>
      </div>
    </div>
  );
}
