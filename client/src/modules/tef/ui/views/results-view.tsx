'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowUp, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { bricolage } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { SuccessLottie } from '@/modules/tef/ui/components/success-lottie';
import { useTefProfileQuery } from '@/modules/tef/hooks/use-tef-queries';
import { useLessonStore } from '@/store/lessonStore';
import { Badge } from '@/components/ui/badge';

const panelClass = 'rounded-2xl bg-[#FCFCFC] dark:bg-[#1C1C1C]';

export function ResultsView() {
  const router = useRouter();
  const diagnostic = useLessonStore((s) => s.lastDiagnostic);
  const { data: profile } = useTefProfileQuery();

  useEffect(() => {
    if (!diagnostic) router.replace('/learn');
  }, [diagnostic, router]);

  if (!diagnostic) return null;

  const { overallAccuracy, skillBreakdown = [], weakAreas = [], adjustment, newLevel } = diagnostic;
  const pct = overallAccuracy != null ? Math.round(overallAccuracy * 100) : null;
  const xpGain = pct != null ? pct + (skillBreakdown.length || 1) * 5 : 0;
  const levelLabel = profile?.level || newLevel;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col sm:max-w-3xl">
      <main className="flex-1 px-4 py-6 pb-24 sm:px-6">
        <div className={cn('overflow-hidden px-5 py-8 text-center', panelClass)}>
          <h1
            className={`${bricolage.className} text-3xl font-semibold tracking-tight sm:text-4xl`}
          >
            Lesson complete
          </h1>

          <div className="relative mx-auto h-44 w-full max-w-[17rem] sm:h-52 sm:max-w-[20rem]">
            {pct != null && (
              <p
                className={`${bricolage.className} pointer-events-none absolute inset-x-0 top-[14%] z-10 text-5xl font-semibold tabular-nums sm:text-6xl`}
              >
                {pct}
                <span className="text-sm text-muted-foreground">%</span>
              </p>
            )}
            <SuccessLottie className="absolute inset-0" />
          </div>
        </div>

        <div className={cn('mt-4 flex items-center gap-2 px-5 py-4 text-sm', panelClass)}>
          <Star className="h-4 w-4 shrink-0 text-amber-500" />
          <p className="font-medium text-foreground">+{xpGain} XP earned</p>
        </div>

        {adjustment && (
          <div
            className={cn(
              'mt-4 flex items-start gap-2 px-5 py-4 text-sm',
              panelClass,
              adjustment === 'levelUp' && 'text-primary',
              adjustment === 'levelDown' && 'text-amber-600 dark:text-amber-500',
              adjustment === 'same' && 'text-muted-foreground'
            )}
          >
            {adjustment === 'levelUp' && <ArrowUp className="mt-0.5 h-4 w-4 shrink-0" />}
            <p className="font-medium">
              {adjustment === 'levelUp' && `Level up → ${newLevel}`}
              {adjustment === 'levelDown' && `Level adjusted → ${newLevel}`}
              {adjustment === 'same' && `Level unchanged  ${levelLabel}`}
            </p>
          </div>
        )}

        {skillBreakdown.length > 0 && (
          <section className={cn('mt-4 space-y-4 px-5 py-4', panelClass)}>
            <h2 className={`${bricolage.className} text-base font-semibold`}>Skills breakdown</h2>
            <ul className="space-y-4">
              {skillBreakdown.map((s) => {
                const skillPct = Math.round((s.accuracy ?? 0) * 100);
                return (
                  <li key={s.skillTag} className="space-y-2">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium capitalize">{s.skillTag}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {s.correct}/{s.total}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-black/8 dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${skillPct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {weakAreas.length > 0 && (
          <section className={cn('mt-3 px-5 py-4', panelClass)}>
            <h2 className={`${bricolage.className} text-base font-semibold`}>Focus next</h2>
            <ul className="mt-3 space-y-2">
              {weakAreas.map((tag) => (
                <Badge
                  variant='secondary'
                  key={tag}
                  className="text-sm capitalize text-muted-foreground"
                >
                  {tag}
                </Badge>
              ))}
            </ul>
          </section>
        )}

      </main>

      <div className="fixed bottom-5 left-0 right-0 z-40 bg-transparent px-2.5 sm:px-4">
        <div className="mx-auto flex w-full max-w-xl items-center gap-1.5 overflow-hidden rounded-4xl border border-black/8 bg-white/72 p-1.5 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-black/65 md:rounded-full">
          <Button
            variant="pillGlass"
            size="pill"
            className="min-w-0 flex-1"
            onClick={() => router.push('/learn/lesson?mode=placement&fresh=1')}
          >
            Retake
          </Button>
          <Button
            variant="pillPrimary"
            size="pill"
            className="min-w-0 flex-1"
            onClick={() => router.push('/learn/lesson?mode=practice')}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
