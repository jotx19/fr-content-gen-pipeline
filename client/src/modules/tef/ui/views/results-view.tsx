'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowUp, Home, Star } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { bricolage, inter } from '@/lib/fonts';
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
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col sm:max-w-3xl">
      <div className="flex-1 px-4 py-6 pb-32 sm:px-6">
        <div className={cn('overflow-hidden px-5 py-8 text-center', panelClass)}>
          <h1
            className={`${bricolage.className} text-3xl font-semibold tracking-tight sm:text-4xl`}
          >
            Lesson complete
          </h1>

          <div className="relative mx-auto mt-2 h-44 w-full max-w-[17rem] sm:h-52 sm:max-w-[20rem]">
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

        <div className={cn('mt-4 space-y-4 px-5 py-5', panelClass)}>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/15">
              <Star className="h-4 w-4 text-amber-500" strokeWidth={2} />
            </span>
            <p className={`${inter.className} text-sm font-medium text-foreground`}>
              +{xpGain} XP earned
            </p>
          </div>

          {adjustment && (
            <div
              className={cn(
                'flex items-start gap-2.5 text-sm',
                adjustment === 'levelUp' && 'text-primary',
                adjustment === 'levelDown' && 'text-amber-600 dark:text-amber-500',
                adjustment === 'same' && 'text-muted-foreground',
              )}
            >
              {adjustment === 'levelUp' && <ArrowUp className="mt-0.5 h-4 w-4 shrink-0" />}
              <p className={`${inter.className} font-medium`}>
                {adjustment === 'levelUp' && `Level up → ${newLevel}`}
                {adjustment === 'levelDown' && `Level adjusted → ${newLevel}`}
                {adjustment === 'same' && `Level unchanged · ${levelLabel}`}
              </p>
            </div>
          )}

          {skillBreakdown.length > 0 && (
            <section className="space-y-4 border-t border-black/8 pt-5 dark:border-white/10">
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
                          className="h-full rounded-full bg-[#58cc02] transition-all duration-500"
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
            <section className="space-y-3 border-t border-black/8 pt-5 dark:border-white/10">
              <h2 className={`${bricolage.className} text-base font-semibold`}>Focus next</h2>
              <div className="flex flex-wrap gap-2">
                {weakAreas.map((tag) => (
                  <Badge
                    variant="secondary"
                    key={tag}
                    className="text-sm capitalize text-muted-foreground"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <div className="fixed bottom-5 left-0 right-0 z-40 px-2.5 sm:px-4">
        <div className="mx-auto grid w-full max-w-xl grid-cols-3 gap-1.5 overflow-hidden rounded-4xl border border-black/8 bg-white/72 p-1.5 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-black/65 md:rounded-full">
          <Button
            variant="pillGlass"
            size="pill"
            className="min-w-0 px-3"
            onClick={() => router.push('/learn/lesson?mode=placement&fresh=1')}
          >
            Retake
          </Button>
          <Button
            variant="pillPrimary"
            size="pill"
            className="min-w-0 px-3"
            onClick={() => router.push('/learn/lesson?mode=practice')}
          >
            Continue
          </Button>
          <Button
            variant="pillGlass"
            size="pill"
            className="min-w-0 px-3"
            onClick={() => router.push('/learn')}
          >
            <Home className="h-4 w-4" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}
