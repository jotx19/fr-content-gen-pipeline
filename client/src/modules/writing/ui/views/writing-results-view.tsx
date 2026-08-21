'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Award,
  BookOpen,
  Energy,
  Home,
  PenLine,
  RefreshCw,
  Star,
} from '@/components/icons';
import { Button } from '@/components/ui/button';
import { AnimatedText } from '@/components/ui/animated-text';
import { bricolage, inter } from '@/lib/fonts';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { WritingCriterionScore } from '@/modules/writing/types/writing';
import { useWritingStore } from '@/store/writingStore';

const springIn = {
  type: 'spring' as const,
  stiffness: 280,
  damping: 24,
  mass: 0.85,
};

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

const palette = {
  sky: {
    bg: 'bg-[#DDEEF8] dark:bg-[#1E2D38]',
    bar: 'bg-[#4A7C9B] dark:bg-[#6BA3C4]',
    barMuted: 'bg-[#4A7C9B]/30 dark:bg-[#6BA3C4]/28',
    label: 'text-[#3D6578] dark:text-[#9EC5DE]',
    value: 'text-[#1A3344] dark:text-[#DDEEF8]',
  },
  butter: {
    bg: 'bg-[#FFF4D6] dark:bg-[#3A3218]',
    bar: 'bg-[#C9A227] dark:bg-[#D4B04A]',
    barMuted: 'bg-[#C9A227]/32 dark:bg-[#D4B04A]/28',
    label: 'text-[#8A7020] dark:text-[#E8D48A]',
    value: 'text-[#3D3010] dark:text-[#FFF4D6]',
  },
  mint: {
    bg: 'bg-[#D4F5E4] dark:bg-[#1E3328]',
    bar: 'bg-[#4A9B62] dark:bg-[#6BC48A]',
    barMuted: 'bg-[#4A9B62]/35 dark:bg-[#6BC48A]/30',
    label: 'text-[#3D7A52] dark:text-[#9EDDB5]',
    value: 'text-[#0F2818] dark:text-[#D4F5E4]',
  },
  lavender: {
    bg: 'bg-[#E8E0FF] dark:bg-[#2E2840]',
    bar: 'bg-[#8B7FD4] dark:bg-[#A99EF0]',
    barMuted: 'bg-[#8B7FD4]/35 dark:bg-[#A99EF0]/30',
    label: 'text-[#6B5BA8] dark:text-[#C4B8F5]',
    value: 'text-[#1E1638] dark:text-[#E8E0FF]',
  },
  rose: {
    bg: 'bg-[#FFE0EC] dark:bg-[#3A2230]',
    bar: 'bg-[#C45B7A] dark:bg-[#E07A98]',
    barMuted: 'bg-[#C45B7A]/32 dark:bg-[#E07A98]/28',
    label: 'text-[#9E4560] dark:text-[#F0A8BE]',
    value: 'text-[#4A1A2A] dark:text-[#FFE0EC]',
  },
} as const;

type BentoPalette = (typeof palette)[keyof typeof palette];

function useCountUp(target: number, duration = 800, delay = 180, enabled = true) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled || target <= 0) {
      setValue(enabled ? target : 0);
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
  }, [target, duration, delay, enabled]);

  return value;
}

function useStagedReveal(stepCount: number, intervalMs = 420, enabled = true) {
  const [step, setStep] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!enabled || reduceMotion) {
      setStep(stepCount - 1);
      return;
    }
    setStep(0);
    let current = 0;
    const id = window.setInterval(() => {
      current += 1;
      if (current >= stepCount) {
        window.clearInterval(id);
        setStep(stepCount - 1);
        return;
      }
      setStep(current);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [stepCount, intervalMs, enabled, reduceMotion]);

  return step;
}

function inferLevelBefore(adjustment: string | undefined, newLevel: string | undefined) {
  if (!adjustment || adjustment === 'same' || !newLevel) return newLevel;
  const idx = CEFR_LEVELS.indexOf(newLevel as (typeof CEFR_LEVELS)[number]);
  if (idx < 0) return newLevel;
  if (adjustment === 'levelUp') return idx > 0 ? CEFR_LEVELS[idx - 1] : newLevel;
  if (adjustment === 'levelDown') return idx < CEFR_LEVELS.length - 1 ? CEFR_LEVELS[idx + 1] : newLevel;
  return newLevel;
}

function buildTrendBars(current: number, previous: number | null, count = 7): number[] {
  const end = Math.max(12, Math.min(100, current));
  const start = previous != null ? Math.max(12, Math.min(100, previous)) : Math.max(12, end - 18);
  return Array.from({ length: count }, (_, i) => {
    const t = count <= 1 ? 1 : i / (count - 1);
    const eased = t * t * (3 - 2 * t);
    return Math.round(start + (end - start) * eased);
  });
}

function shortenLabel(label: string) {
  return label
    .replace('Content / Coherence', 'Coherence')
    .replace('Language Accuracy', 'Accuracy')
    .replace('Task Fulfillment', 'Task');
}

function CapsuleBars({
  values,
  palette: pal,
  visible,
  compact,
}: {
  values: number[];
  palette: BentoPalette;
  visible: boolean;
  compact?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={cn('flex min-h-0 flex-1 items-end gap-1 sm:gap-1.5', compact && 'min-h-12')}>
      {values.map((v, i) => (
        <div
          key={i}
          className={cn(
            'relative flex h-full flex-1 flex-col justify-end',
            compact ? 'min-h-12' : 'min-h-[3.5rem] sm:min-h-14',
          )}
        >
          <motion.div
            className={cn('relative w-full rounded-full', pal.bar)}
            initial={{ height: 0 }}
            animate={{ height: visible ? `${v}%` : 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.65,
              delay: reduceMotion ? 0 : 0.08 + i * 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        </div>
      ))}
    </div>
  );
}

function BentoCard({
  children,
  className,
  palette: pal,
  delay = 0,
  visible,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  palette: BentoPalette;
  delay?: number;
  visible: boolean;
  onClick?: () => void;
}) {
  const Tag = onClick ? motion.button : motion.div;

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex w-full min-h-[11.5rem] shrink-0 flex-col overflow-hidden rounded-[1.75rem] p-3.5 text-left sm:min-h-0 sm:h-full sm:rounded-[2rem] sm:p-4',
        pal.bg,
        onClick && 'cursor-pointer transition-transform active:scale-[0.98]',
        className,
      )}
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 16, scale: visible ? 1 : 0.96 }}
      transition={{ ...springIn, delay }}
    >
      {children}
    </Tag>
  );
}

function CardHeader({
  icon: Icon,
  label,
  palette: pal,
  trailing,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  palette: BentoPalette;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-1.5">
        <Icon className={cn('h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4', pal.label)} strokeWidth={2} />
        <span className={cn(`${inter.className} truncate text-[11px] font-semibold sm:text-xs`, pal.label)}>
          {label}
        </span>
      </div>
      {trailing}
    </div>
  );
}

function CriteriaXpBar({
  xpEarned,
  xpNeeded,
  nextLevel,
  percent,
  palette: pal,
}: {
  xpEarned: number;
  xpNeeded: number;
  nextLevel: string;
  percent: number;
  palette: BentoPalette;
}) {
  return (
    <div className="relative mb-3 shrink-0 overflow-hidden rounded-full bg-[#9E4560]/28 dark:bg-[#F0A8BE]/12">
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full bg-[#C45B7A]/45 dark:bg-[#E07A98]/35"
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      />
      <div className="relative flex items-center justify-between gap-2 px-3 py-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <Energy className={cn('h-3.5 w-3.5 shrink-0', pal.label)} strokeWidth={2} />
          <span className={cn(`${inter.className} text-[10px] font-medium sm:text-xs`, pal.label)}>
            XP to level up
          </span>
        </div>
        <span className={cn(`${inter.className} shrink-0 text-[10px] tabular-nums sm:text-xs`, pal.value)}>
          {xpEarned}
          <span className={cn('font-normal', pal.label)}> / </span>
          <span className="font-bold">{xpNeeded}</span>
          <span className={cn('ml-1 font-medium', pal.label)}>for {nextLevel}</span>
        </span>
      </div>
    </div>
  );
}

function AnimatedCriteriaPanel({
  criteria,
  suggestions,
  activeIndex,
  visible,
  palette: pal,
}: {
  criteria: WritingCriterionScore[];
  suggestions: string[];
  activeIndex: number;
  visible: boolean;
  palette: BentoPalette;
}) {
  const current = criteria[activeIndex];
  const score = current?.score ?? 0;

  if (criteria.length > 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current?.criterion}
            className="flex flex-col gap-1.5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 8 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <AnimatedText
              text={shortenLabel(current?.label ?? '')}
              className={cn(`${inter.className} text-sm font-semibold sm:text-base`, pal.value)}
              remountOnChange
              delayStep={0.03}
            />
            <p className={cn(`${bricolage.className} text-2xl font-bold tabular-nums sm:text-3xl`, pal.value)}>
              <AnimatedText text={`${score}`} remountOnChange delayStep={0.04} />
              <span className={cn('text-sm font-semibold sm:text-base', pal.label)}>/100</span>
            </p>
            {current?.feedback && (
              <p className={cn(`${inter.className} line-clamp-2 text-[11px] leading-relaxed sm:text-xs`, pal.label)}>
                {current.feedback}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  if (suggestions.length > 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-wrap content-center gap-1.5">
        {suggestions.slice(0, 4).map((tip, i) => (
          <motion.span
            key={tip}
            className={cn(
              'rounded-full bg-[#C45B7A]/20 px-2.5 py-1 text-[10px] font-medium sm:text-xs',
              pal.value,
            )}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...springIn, delay: 0.1 + i * 0.05 }}
          >
            {tip.length > 42 ? `${tip.slice(0, 42)}…` : tip}
          </motion.span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <p className={cn('text-xs font-medium', pal.label)}>Nice draft!</p>
    </div>
  );
}

export function WritingResultsView() {
  const router = useRouter();
  const { t } = useI18n();
  const result = useWritingStore((s) => s.lastResult);
  const [activeCriterion, setActiveCriterion] = useState(0);
  const [scoreReplay, setScoreReplay] = useState(0);

  const revealIndex = useStagedReveal(4, 400, Boolean(result));

  useEffect(() => {
    if (!result) router.replace('/learn/writing');
  }, [result, router]);

  const criteria = result?.criteria ?? [];
  const suggestions = result?.suggestions ?? [];

  useEffect(() => {
    if (criteria.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveCriterion((i) => (i + 1) % criteria.length);
    }, 5500);
    return () => window.clearInterval(id);
  }, [criteria.length]);

  const cycleCriterion = useCallback(() => {
    if (criteria.length <= 1) return;
    setActiveCriterion((i) => (i + 1) % criteria.length);
  }, [criteria.length]);

  const replayScore = useCallback(() => setScoreReplay((n) => n + 1), []);

  const scoreBars = useMemo(() => {
    const score = result?.overallScore ?? 0;
    return buildTrendBars(score, Math.max(0, score - 15));
  }, [result?.overallScore, scoreReplay]);

  const wordBars = useMemo(() => {
    const words = result?.wordCount ?? 0;
    const normalized = Math.min(100, Math.max(15, Math.round((words / 250) * 100)));
    return buildTrendBars(normalized, Math.max(12, normalized - 20));
  }, [result?.wordCount]);

  const xpBars = useMemo(() => {
    const total = result?.writingXp ?? 0;
    const gain = result?.xpGain ?? 0;
    const from = Math.max(0, total - gain);
    return buildTrendBars(total % 100 || 40, from % 100 || 20);
  }, [result?.writingXp, result?.xpGain]);

  const levelIdx = CEFR_LEVELS.indexOf(
    (result?.newLevel ?? 'A1') as (typeof CEFR_LEVELS)[number],
  );
  const levelBars = useMemo(
    () => buildTrendBars(Math.max(20, ((levelIdx + 1) / CEFR_LEVELS.length) * 100), 20),
    [levelIdx],
  );

  const criteriaXpBar = useMemo(() => {
    const prog = result?.writingProgress;
    if (!prog?.nextLevel || prog.nextThreshold == null) return null;

    const xpNeeded = prog.nextThreshold - prog.currentThreshold;
    if (xpNeeded <= 0) return null;

    const total = result?.writingXp ?? prog.xp ?? 0;
    const xpEarned = Math.max(0, total - prog.currentThreshold);
    const percent = Math.min(100, Math.round((xpEarned / xpNeeded) * 100));

    return { xpEarned, xpNeeded, nextLevel: prog.nextLevel, percent };
  }, [result?.writingProgress, result?.writingXp]);

  if (!result) return null;

  const {
    overallScore,
    wordCount,
    xpGain,
    writingXp,
    adjustment,
    newLevel,
    summary,
  } = result;

  const levelAfter = newLevel ?? '—';
  const levelBefore = inferLevelBefore(adjustment, newLevel);
  const isLevelUp = adjustment === 'levelUp';
  const isLevelDown = adjustment === 'levelDown';

  const animatedScore = useCountUp(overallScore, 900, 120, revealIndex >= 0);
  const animatedWords = useCountUp(wordCount, 800, 200, revealIndex >= 0);
  const animatedXp = useCountUp(xpGain ?? 0, 1000, 280, revealIndex >= 1);
  const animatedTotalXp = useCountUp(writingXp ?? 0, 1100, 400, revealIndex >= 2);

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-2xl flex-col overflow-hidden bg-background px-4 py-3 sm:max-w-3xl sm:py-4">
      <motion.header
        className="mb-2.5 flex shrink-0 items-center gap-3 sm:mb-3"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springIn}
      >
        <Button
          variant="pillGlass"
          size="pill"
          className="shrink-0 px-2 text-xs sm:px-3 sm:text-sm"
          onClick={() => router.push('/learn')}
        >
          <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.25} />
          {t('common.home')}
        </Button>

        <div className="flex min-w-0 flex-1 items-center justify-end">
          <div className="grid w-full max-w-xs grid-cols-2 gap-1.5 overflow-hidden rounded-4xl border border-black/8 bg-white/72 p-1.5 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-black/65 sm:max-w-sm md:rounded-full">
            <Button
              variant="pillGlass"
              size="pill"
              className="min-w-0 px-2 text-xs sm:px-3 sm:text-sm"
              onClick={() => router.push('/learn/writing')}
            >
              <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.25} />
              Again
            </Button>
            <Button
              variant="pillPrimary"
              size="pill"
              className="min-w-0 px-2 text-xs sm:px-3 sm:text-sm"
              onClick={() => router.push('/learn')}
            >
              {t('common.continue')}
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col gap-3 sm:grid sm:grid-cols-2 sm:grid-rows-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.15fr)] sm:gap-3">
          <div className="grid shrink-0 grid-cols-2 gap-3 sm:contents">
            <BentoCard
              palette={palette.sky}
              visible={revealIndex >= 0}
              delay={0}
              onClick={replayScore}
              className="sm:col-start-1 sm:row-start-1"
            >
              <CardHeader icon={PenLine} label="Overall score" palette={palette.sky} />
              <CapsuleBars values={scoreBars} palette={palette.sky} visible={revealIndex >= 0} compact />
              <div className="mt-2 flex shrink-0 items-baseline gap-1">
                <p className={cn(`${bricolage.className} text-3xl font-bold tabular-nums sm:text-4xl`, palette.sky.value)}>
                  {animatedScore}
                </p>
                <span className={cn('text-sm font-semibold sm:text-base', palette.sky.label)}>/100</span>
              </div>
            </BentoCard>

            <BentoCard
              palette={palette.butter}
              visible={revealIndex >= 0}
              delay={0.05}
              className="sm:col-start-2 sm:row-start-1"
            >
              <CardHeader icon={BookOpen} label="Word count" palette={palette.butter} />
              <CapsuleBars values={wordBars} palette={palette.butter} visible={revealIndex >= 0} compact />
              <div className="mt-2 flex shrink-0 items-baseline gap-1.5">
                <p className={cn(`${bricolage.className} text-3xl font-bold tabular-nums sm:text-4xl`, palette.butter.value)}>
                  {animatedWords}
                </p>
                <span className={cn(`${inter.className} text-xs font-semibold sm:text-sm`, palette.butter.label)}>
                  words
                </span>
              </div>
            </BentoCard>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-3 sm:contents">
            <BentoCard
              palette={palette.mint}
              visible={revealIndex >= 1}
              delay={0.08}
              className="sm:col-start-1 sm:row-start-2"
            >
              <CardHeader
                icon={Energy}
                label={t('results.writingXp')}
                palette={palette.mint}
                trailing={
                  <span className={cn('text-[9px] font-semibold tabular-nums sm:text-xs', palette.mint.label)}>
                    {animatedTotalXp} total
                  </span>
                }
              />
              <CapsuleBars values={xpBars} palette={palette.mint} visible={revealIndex >= 1} compact />
              <div className="mt-2 flex shrink-0 items-baseline gap-1">
                <span className={cn(`${bricolage.className} text-3xl font-bold tabular-nums sm:text-4xl`, palette.mint.value)}>
                  <AnimatedText text={`+${animatedXp}`} remountOnChange={false} delayStep={0.015} />
                </span>
                <span className={cn(`${inter.className} text-sm font-semibold`, palette.mint.label)}>{t('common.xp')}</span>
              </div>
            </BentoCard>

            <BentoCard
              palette={palette.lavender}
              visible={revealIndex >= 1}
              delay={0.1}
              className="sm:col-start-2 sm:row-start-2"
            >
              <CardHeader icon={Award} label={t('results.writingLevel')} palette={palette.lavender} />
              <CapsuleBars values={levelBars} palette={palette.lavender} visible={revealIndex >= 2} compact />
              <div className="mt-2 flex shrink-0 items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-1.5">
                  {levelBefore && levelBefore !== levelAfter && (
                    <>
                      <span
                        className={cn(
                          `${bricolage.className} text-lg font-semibold tabular-nums line-through opacity-40 sm:text-xl`,
                          palette.lavender.value,
                        )}
                      >
                        {levelBefore}
                      </span>
                      <ArrowRight className={cn('h-3.5 w-3.5 shrink-0', palette.lavender.label)} strokeWidth={2.25} />
                    </>
                  )}
                  <motion.span
                    key={levelAfter}
                    className={cn(`${bricolage.className} text-3xl font-bold tabular-nums sm:text-4xl`, palette.lavender.value)}
                    initial={{ opacity: 0, y: isLevelUp ? 10 : isLevelDown ? -10 : 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springIn, delay: 0.35 }}
                  >
                    {levelAfter}
                  </motion.span>
                </div>
                {adjustment && (
                  <motion.span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      isLevelUp && 'bg-[#4A9B62]/25',
                      isLevelDown && 'bg-[#E8956A]/25',
                      adjustment === 'same' && 'bg-[#8B7FD4]/20',
                    )}
                    animate={isLevelUp ? { scale: [1, 1.15, 1], rotate: [0, -8, 0] } : undefined}
                    transition={{ duration: 0.5, delay: 0.45 }}
                  >
                    {isLevelUp ? (
                      <ArrowUp className="h-4 w-4 text-[#4A9B62]" strokeWidth={2.25} />
                    ) : isLevelDown ? (
                      <ArrowDown className="h-4 w-4 text-[#E8956A]" strokeWidth={2.25} />
                    ) : (
                      <Award className={cn('h-4 w-4', palette.lavender.label)} strokeWidth={2} />
                    )}
                  </motion.span>
                )}
              </div>
            </BentoCard>
          </div>

          <BentoCard
            palette={palette.rose}
            visible={revealIndex >= 2}
            delay={0.14}
            onClick={criteria.length > 1 ? cycleCriterion : undefined}
            className="min-h-[16rem] sm:col-span-2 sm:row-start-3 sm:min-h-0"
          >
            <CardHeader
              icon={Star}
              label="TEF criteria"
              palette={palette.rose}
              trailing={
                criteria.length > 1 ? (
                  <span className={cn('text-[10px] font-medium sm:text-xs', palette.rose.label)}>
                    {activeCriterion + 1}/{criteria.length}
                  </span>
                ) : null
              }
            />
            {criteriaXpBar && (
              <CriteriaXpBar
                xpEarned={criteriaXpBar.xpEarned}
                xpNeeded={criteriaXpBar.xpNeeded}
                nextLevel={criteriaXpBar.nextLevel}
                percent={criteriaXpBar.percent}
                palette={palette.rose}
              />
            )}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <AnimatedCriteriaPanel
                criteria={criteria}
                suggestions={suggestions}
                activeIndex={activeCriterion}
                visible={revealIndex >= 3}
                palette={palette.rose}
              />
              {summary && (
                <motion.p
                  className={cn(
                    `${inter.className} mt-auto shrink-0 border-t border-black/8 pt-2 text-[10px] leading-relaxed sm:text-[11px] dark:border-white/10`,
                    palette.rose.label,
                  )}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: revealIndex >= 3 ? 1 : 0 }}
                  transition={{ duration: 0.35, delay: 0.1 }}
                >
                  {summary}
                </motion.p>
              )}
            </div>
          </BentoCard>
        </div>
      </div>
    </div>
  );
}
