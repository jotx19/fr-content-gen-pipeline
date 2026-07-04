'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUp, Award, ChartBarIncreasing, ChevronDown, Energy, Home, RefreshCw } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { AnimatedText } from '@/components/ui/animated-text';
import { Separator } from '@/components/ui/separator';
import { bricolage, inter } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { SuccessLottie } from '@/modules/tef/ui/components/success-lottie';
import { useTefProfileQuery } from '@/modules/tef/hooks/use-tef-queries';
import { useLessonStore } from '@/store/lessonStore';
import { Badge } from '@/components/ui/badge';

const panelClass = 'rounded-2xl bg-[#FCFCFC] dark:bg-[#1C1C1C]';
const mutedTextClass = 'text-black/50 dark:text-white/50';
const subtleIconClass = 'text-black/45 dark:text-white/45';

const springIn = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 22,
  mass: 0.9,
};

function useCountUp(target: number, duration = 900, delay = 220) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target <= 0) {
      setValue(0);
      return;
    }

    let raf = 0;
    const timeout = window.setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setValue(Math.round(target * eased));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [target, duration, delay]);

  return value;
}

function skillBarColor(pct: number) {
  if (pct >= 70) return 'bg-duo-green';
  if (pct >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

function skillPctBadgeClass(pct: number) {
  if (pct >= 70) return 'bg-duo-green/15 text-duo-green';
  if (pct >= 40) return 'bg-amber-500/15 text-amber-600 dark:text-amber-500';
  return 'bg-red-500/15 text-red-600 dark:text-red-400';
}

function SkillBreakdownRow({
  skillTag,
  correct,
  total,
  accuracy,
  index,
}: {
  skillTag: string;
  correct: number;
  total: number;
  accuracy: number;
  index: number;
}) {
  const skillPct = Math.round((accuracy ?? 0) * 100);

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springIn, delay: 0.08 + index * 0.07 }}
      className="rounded-xl border border-black/6 bg-black/[0.02] px-3.5 py-3 dark:border-white/8 dark:bg-white/[0.03]"
    >
      <div className="flex items-center justify-between gap-3">
        <span className={`${inter.className} text-sm font-medium capitalize`}>{skillTag}</span>
        <div className="flex shrink-0 items-center gap-2">
          <span className={cn('text-xs tabular-nums', mutedTextClass)}>
            {correct}/{total}
          </span>
          <span
            className={cn(
              'rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums',
              skillPctBadgeClass(skillPct),
            )}
          >
            {skillPct}%
          </span>
        </div>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-black/8 dark:bg-white/10">
        <motion.div
          className={cn('h-full rounded-full', skillBarColor(skillPct))}
          initial={{ width: 0 }}
          animate={{ width: `${skillPct}%` }}
          transition={{ duration: 0.75, delay: 0.12 + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </motion.li>
  );
}

function AnimatedXpEarned({
  xpGain,
  adjustment,
  newLevel,
  levelLabel,
}: {
  xpGain: number;
  adjustment?: string;
  newLevel?: string;
  levelLabel?: string;
}) {
  const animatedXp = useCountUp(xpGain, 2200, 280);

  const levelText =
    adjustment === 'levelUp'
      ? 'Level up'
      : adjustment === 'levelDown'
        ? 'Level adjusted'
        : 'Level unchanged';

  const level =
    adjustment === 'same' ? levelLabel : newLevel;

  const LevelIcon =
    adjustment === 'levelUp' ? ArrowUp : adjustment === 'levelDown' ? ArrowDown : Award;

  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ ...springIn, delay: 0.18 }}
    >
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <motion.span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-amber-500/15"
            initial={{ scale: 0.6, rotate: -12 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ ...springIn, delay: 0.22 }}
          >
            <Energy className="h-4 w-4 text-amber-500 fill-amber-500" strokeWidth={2} />
          </motion.span>
          <p className={`${inter.className} flex items-baseline gap-1 text-sm font-medium text-foreground`}>
            <AnimatedText
              text={`+${animatedXp}`}
              remountOnChange={false}
              delayStep={0.02}
              className="tabular-nums font-extrabold"
            />
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...springIn, delay: 0.35 }}
            >
              XP
            </motion.span>
          </p>
        </div>

        {adjustment && (
          <>
            <Separator orientation="vertical" className="h-8 bg-black/8 dark:bg-white/10" />

            <motion.div
              className={cn(
                'flex min-w-0 flex-1 items-center gap-2.5 text-sm',
                adjustment === 'levelUp' && 'text-primary',
                adjustment === 'levelDown' && 'text-amber-600 dark:text-amber-500',
                adjustment === 'same' && mutedTextClass,
              )}
              initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ ...springIn, delay: 0.42 }}
            >
              <motion.span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-green-500/15"
                initial={{ scale: 0.6, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ ...springIn, delay: 0.48 }}
              >
                <LevelIcon className="h-4 w-4 text-green-500 fill-green-500" strokeWidth={2} />
              </motion.span>
              <p className={`${inter.className} flex min-w-0 items-center gap-1 font-medium`}>
                <motion.span
                  className="hidden sm:inline"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...springIn, delay: 0.52 }}
                >
                  {levelText}
                </motion.span>
                {level ? (
                  <>
                    <motion.span
                      className="hidden sm:inline-flex shrink-0 items-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.58 }}
                      aria-hidden
                    >
                      <ArrowRight className={cn('h-3.5 w-3.5', subtleIconClass)} strokeWidth={2.25} />
                    </motion.span>
                    <motion.span
                      key={level}
                      className={cn(
                        'inline-block font-semibold tabular-nums',
                        adjustment !== 'same' && 'text-foreground dark:text-white',
                      )}
                      initial={{ opacity: 0, y: 10, scale: 0.82, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                      transition={{ ...springIn, delay: 0.64 }}
                    >
                      {level}
                    </motion.span>
                  </>
                ) : null}
              </p>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}

export function ResultsView() {
  const router = useRouter();
  const diagnostic = useLessonStore((s) => s.lastDiagnostic);
  const { data: profile } = useTefProfileQuery();
  const [skillsOpen, setSkillsOpen] = useState(true);
  const [focusOpen, setFocusOpen] = useState(false);

  useEffect(() => {
    if (!diagnostic) router.replace('/learn');
  }, [diagnostic, router]);

  if (!diagnostic) return null;

  const { overallAccuracy, skillBreakdown = [], weakAreas = [], adjustment, newLevel } = diagnostic;
  const pct = overallAccuracy != null ? Math.round(overallAccuracy * 100) : null;
  const xpGain = pct != null ? pct + (skillBreakdown.length || 1) * 5 : 0;
  const levelLabel = profile?.level || newLevel || diagnostic.profile?.level;

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
                <span className={cn('text-sm', mutedTextClass)}>%</span>
              </p>
            )}
            <SuccessLottie className="absolute inset-0" />
          </div>
        </div>

        <div className={cn('mt-4 space-y-4 px-5 py-5', panelClass)}>
          <AnimatedXpEarned
            xpGain={xpGain}
            adjustment={adjustment}
            newLevel={newLevel}
            levelLabel={levelLabel}
          />

          {skillBreakdown.length > 0 && (
            <section className="border-t border-black/8 pt-5 dark:border-white/10">
              <button
                type="button"
                onClick={() => setSkillsOpen((open) => !open)}
                aria-expanded={skillsOpen}
                className="flex w-full items-center justify-between gap-3 rounded-lg py-1 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-black/5 dark:bg-white/8">
                    <ChartBarIncreasing className={cn('h-4 w-4', subtleIconClass)} strokeWidth={2} />
                  </span>
                  <div>
                    <h2 className={`${bricolage.className} text-base font-semibold`}>
                      Skills breakdown
                    </h2>
                    <p className={cn('text-xs', mutedTextClass)}>
                      {skillBreakdown.length} skill{skillBreakdown.length === 1 ? '' : 's'} assessed
                    </p>
                  </div>
                </div>
                <span className={cn('flex items-center gap-1.5 text-xs', mutedTextClass)}>
                  {skillsOpen ? 'Hide' : 'Show'}
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 transition-transform duration-200',
                      skillsOpen && 'rotate-180',
                    )}
                    strokeWidth={2.25}
                  />
                </span>
              </button>

              {skillsOpen && (
                <ul className="mt-4 space-y-2.5">
                  {skillBreakdown.map((s, index) => (
                    <SkillBreakdownRow
                      key={s.skillTag}
                      skillTag={s.skillTag}
                      correct={s.correct}
                      total={s.total}
                      accuracy={s.accuracy ?? 0}
                      index={index}
                    />
                  ))}
                </ul>
              )}
            </section>
          )}

          {weakAreas.length > 0 && (
            <section className="border-t border-black/8 pt-5 dark:border-white/10">
              <button
                type="button"
                onClick={() => setFocusOpen((open) => !open)}
                aria-expanded={focusOpen}
                className="flex w-full items-center justify-between gap-3 rounded-lg py-1 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-black/5 dark:bg-white/8">
                    <Award className={cn('h-4 w-4', subtleIconClass)} strokeWidth={2} />
                  </span>
                  <div>
                    <h2 className={`${bricolage.className} text-base font-semibold`}>Focus next</h2>
                    <p className={cn('text-xs', mutedTextClass)}>
                      {weakAreas.length} area{weakAreas.length === 1 ? '' : 's'} to improve
                    </p>
                  </div>
                </div>
                <span className={cn('flex items-center gap-1.5 text-xs', mutedTextClass)}>
                  {focusOpen ? 'Hide' : 'Show'}
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 transition-transform duration-200',
                      focusOpen && 'rotate-180',
                    )}
                    strokeWidth={2.25}
                  />
                </span>
              </button>

              {focusOpen && (
                <div className="mt-4 flex flex-wrap gap-2 p-2">
                  {weakAreas.map((tag) => (
                    <Badge
                      variant="outline"
                      key={tag}
                      className="border border-dashed border-black/10 bg-black/[0.02] text-sm capitalize text-black/70 dark:border-white/15 dark:bg-white/[0.04] dark:text-white/70"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
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
            <RefreshCw className="h-4 w-4" strokeWidth={2.25} />
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
            <Home className="h-4 w-4" strokeWidth={2.25} />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}
