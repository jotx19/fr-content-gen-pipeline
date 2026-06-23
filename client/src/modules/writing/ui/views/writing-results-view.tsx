'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowUp, PenLine } from 'lucide-react';
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

  const { overallScore, criteria, suggestions, summary, adjustment, newLevel, reason, wordCount } =
    result;

  return (
    <div className="min-h-dvh bg-[#f9f7f2] text-neutral-900">
      <div className="mx-auto max-w-3xl px-4 pb-28 pt-8 sm:px-6">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 text-white">
            <PenLine className="h-6 w-6" strokeWidth={2} />
          </span>
          <h1 className={`${bricolage.className} text-3xl font-semibold`}>Writing evaluated</h1>
          <p className="mt-3 text-5xl font-semibold tabular-nums text-neutral-900">{overallScore}</p>
          <p className="text-sm text-neutral-500">out of 100 · {wordCount} words submitted</p>
        </div>

        {summary && (
          <p className="mb-6 rounded-2xl border border-neutral-200/70 bg-white p-4 text-sm leading-relaxed text-neutral-600">
            {summary}
          </p>
        )}

        {adjustment && (
          <div
            className={cn(
              'mb-6 flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm',
              adjustment === 'levelUp' && 'border-emerald-200 bg-emerald-50 text-emerald-900',
              adjustment === 'levelDown' && 'border-amber-200 bg-amber-50 text-amber-900',
              adjustment === 'same' && 'border-neutral-200 bg-white text-neutral-700'
            )}
          >
            {adjustment === 'levelUp' && <ArrowUp className="mt-0.5 h-4 w-4 shrink-0" />}
            <div>
              {adjustment === 'levelUp' && <p className="font-medium">Level up → {newLevel}</p>}
              {adjustment === 'levelDown' && (
                <p className="font-medium">Level adjusted → {newLevel}</p>
              )}
              {adjustment === 'same' && <p className="font-medium">Level unchanged — {newLevel}</p>}
              {reason && <p className="mt-1 text-neutral-600">{reason}</p>}
            </div>
          </div>
        )}

        <section className="rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-[0_2px_16px_rgba(15,23,42,0.04)]">
          <h2 className={`${bricolage.className} mb-6 text-lg font-semibold`}>Criteria breakdown</h2>
          <WritingCriteriaList criteria={criteria} />
        </section>

        {suggestions?.length > 0 && (
          <section className="mt-6 rounded-2xl border border-neutral-200/70 bg-white p-6">
            <h2 className={`${bricolage.className} mb-4 text-lg font-semibold`}>Suggestions</h2>
            <ul className="space-y-2 text-sm leading-relaxed text-neutral-600">
              {suggestions.map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="text-neutral-400">·</span>
                  {s}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-neutral-200/60 bg-[#f9f7f2]/95 p-4 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => router.push('/learn/writing')}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-neutral-900 text-sm font-medium text-white hover:opacity-90"
          >
            Practice again
          </button>
          <button
            type="button"
            onClick={() => router.push('/learn')}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-neutral-300 bg-white text-sm font-medium text-neutral-900 hover:bg-neutral-50"
          >
            Back to Learn
          </button>
        </div>
      </div>
    </div>
  );
}
