'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Award,
  ChartBarIncreasing,
  Energy,
  Home,
  RefreshCw,
  Target,
} from '@/components/icons';
import { Button } from '@/components/ui/button';
import { AnimatedText } from '@/components/ui/animated-text';
import { bricolage, inter } from '@/lib/fonts';
import { useI18n } from '@/lib/i18n';
import {
  loadLastReadingScore,
  loadLastReadingXp,
  saveLastReadingScore,
  saveLastReadingXp,
} from '@/lib/tef-session-storage';
import { cn } from '@/lib/utils';
import { useTefProfileQuery } from '@/modules/tef/hooks/use-tef-queries';
import { useLessonStore } from '@/store/lessonStore';

const springIn = {
  type: 'spring' as const,
  stiffness: 280,
  damping: 24,
  mass: 0.85,
};

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

const pastel = {
  accuracy: {
    bg: 'bg-[#FFE9DF] dark:bg-[#352620]',
    bar: 'bg-[#C96E48] dark:bg-[#D4845F]',
    barMuted: 'bg-[#C96E48]/30 dark:bg-[#D4845F]/28',
    label: 'text-[#B86B45] dark:text-[#E8A882]',
    value: 'text-[#8B3D20] dark:text-[#FFD4C0]',
    badgeDown: 'bg-[#C96E48]/25 text-[#8B3D20] dark:bg-[#D4845F]/30 dark:text-[#FFD4C0]',
  },
  peach: {
    bg: 'bg-[#FFE8DC] dark:bg-[#3D2E28]',
    bar: 'bg-[#E8956A] dark:bg-[#E8956A]',
    barMuted: 'bg-[#E8956A]/35 dark:bg-[#E8956A]/30',
    label: 'text-[#B86B45] dark:text-[#F0B89A]',
    value: 'text-[#2D1810] dark:text-[#FFE8DC]',
  },
  lavender: {
    bg: 'bg-[#E8E0FF] dark:bg-[#2E2840]',
    bar: 'bg-[#8B7FD4] dark:bg-[#A99EF0]',
    barMuted: 'bg-[#8B7FD4]/35 dark:bg-[#A99EF0]/30',
    label: 'text-[#6B5BA8] dark:text-[#C4B8F5]',
    value: 'text-[#1E1638] dark:text-[#E8E0FF]',
  },
  mint: {
    bg: 'bg-[#D4F5E4] dark:bg-[#1E3328]',
    bar: 'bg-[#4A9B62] dark:bg-[#6BC48A]',
    barMuted: 'bg-[#4A9B62]/35 dark:bg-[#6BC48A]/30',
    label: 'text-[#3D7A52] dark:text-[#9EDDB5]',
    value: 'text-[#0F2818] dark:text-[#D4F5E4]',
  },
} as const;

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

function inferLevelBefore(
  adjustment: string | undefined,
  newLevel: string | undefined,
  profileLevel: string | undefined,
) {
  if (!adjustment || adjustment === 'same' || !newLevel) return profileLevel ?? newLevel;
  const idx = CEFR_LEVELS.indexOf(newLevel as (typeof CEFR_LEVELS)[number]);
  if (idx < 0) return profileLevel ?? newLevel;
  if (adjustment === 'levelUp') return idx > 0 ? CEFR_LEVELS[idx - 1] : newLevel;
  if (adjustment === 'levelDown') return idx < CEFR_LEVELS.length - 1 ? CEFR_LEVELS[idx + 1] : newLevel;
  return profileLevel ?? newLevel;
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

function CapsuleBars({
  values,
  palette,
  visible,
  compareValues,
  compact,
}: {
  values: number[];
  palette: (typeof pastel)[keyof typeof pastel];
  visible: boolean;
  compareValues?: number[];
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
          {compareValues && (
            <motion.div
              className={cn('absolute bottom-0 w-full rounded-full', palette.barMuted)}
              initial={{ height: 0 }}
              animate={{ height: visible ? `${compareValues[i] ?? 0}%` : 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.55,
                delay: reduceMotion ? 0 : 0.04 + i * 0.04,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          )}
          <motion.div
            className={cn('relative w-full rounded-full', palette.bar)}
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
  palette,
  delay = 0,
  visible,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  palette: (typeof pastel)[keyof typeof pastel];
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
        palette.bg,
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
  palette,
  trailing,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  palette: (typeof pastel)[keyof typeof pastel];
  trailing?: React.ReactNode;
}) {
  return (
    <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-1.5">
        <Icon className={cn('h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4', palette.label)} strokeWidth={2} />
        <span className={cn(`${inter.className} truncate text-[11px] font-semibold sm:text-xs`, palette.label)}>
          {label}
        </span>
      </div>
      {trailing}
    </div>
  );
}

function AnimatedSkillPanel({
  skillBreakdown,
  weakAreas,
  activeSkill,
  visible,
  palette,
}: {
  skillBreakdown: { skillTag: string; correct: number; total: number; accuracy: number }[];
  weakAreas: string[];
  activeSkill: number;
  visible: boolean;
  palette: (typeof pastel)[keyof typeof pastel];
}) {
  const currentSkill = skillBreakdown[activeSkill];
  const skillPct = currentSkill ? Math.round((currentSkill.accuracy ?? 0) * 100) : 0;
  const skillBars = buildTrendBars(skillPct, Math.max(0, skillPct - 15));

  if (skillBreakdown.length > 0) {
    return (
      <>
        <AnimatePresence mode="wait">
          <motion.div
            key={`bars-${currentSkill?.skillTag}-${skillPct}`}
            className="flex min-h-[4rem] flex-1 flex-col sm:min-h-0"
            initial={{ opacity: 0, filter: 'blur(6px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(4px)' }}
            transition={{ duration: 0.28 }}
          >
            <CapsuleBars values={skillBars} palette={palette} visible={visible} compact />
          </motion.div>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSkill?.skillTag}
            className="mt-2 flex shrink-0 flex-col gap-0.5"
            initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
            transition={{ ...springIn, duration: 0.35 }}
          >
            <AnimatedText
              text={currentSkill?.skillTag ?? ''}
              className={cn(`${inter.className} truncate text-sm font-semibold capitalize sm:text-base`, palette.value)}
              remountOnChange
              delayStep={0.022}
            />
            <motion.p
              key={`pct-${skillPct}`}
              className={cn(`${bricolage.className} text-3xl font-bold tabular-nums sm:text-3xl`, palette.value)}
              initial={{ opacity: 0, scale: 0.82, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={springIn}
            >
              <AnimatedText text={`${skillPct}%`} remountOnChange delayStep={0.03} />
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </>
    );
  }

  if (weakAreas.length > 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-wrap content-center gap-1.5">
        {weakAreas.slice(0, 4).map((tag, i) => (
          <motion.span
            key={tag}
            className={cn(
              'rounded-full bg-[#E8956A]/25 px-2.5 py-1 text-[10px] font-semibold capitalize sm:text-xs',
              palette.value,
            )}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...springIn, delay: 0.1 + i * 0.05 }}
          >
            {tag}
          </motion.span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <p className={cn('text-xs font-medium', palette.label)}>Great work today!</p>
    </div>
  );
}

export function ResultsView() {
  const router = useRouter();
  const { t } = useI18n();
  const diagnostic = useLessonStore((s) => s.lastDiagnostic);
  const { data: profile } = useTefProfileQuery();
  const [activeSkill, setActiveSkill] = useState(0);
  const [scoreReplay, setScoreReplay] = useState(0);
  const savedRef = useRef(false);

  const revealIndex = useStagedReveal(4, 400, Boolean(diagnostic));

  useEffect(() => {
    if (!diagnostic) router.replace('/learn');
  }, [diagnostic, router]);

  const {
    overallAccuracy,
    skillBreakdown = [],
    weakAreas = [],
    adjustment,
    newLevel,
  } = diagnostic ?? {};

  const pct = overallAccuracy != null ? Math.round(overallAccuracy * 100) : 0;
  const xpGain = pct + (skillBreakdown.length || 1) * 5;
  const levelLabel = profile?.level || newLevel || diagnostic?.profile?.level;

  const sessionMeta = useMemo(() => {
    const previousScore = loadLastReadingScore();
    const previousXp =
      loadLastReadingXp() ??
      Math.max(0, (profile?.stats?.xp ?? profile?.stats?.readingXp ?? xpGain) - xpGain);
    const totalXp = profile?.stats?.xp ?? profile?.stats?.readingXp ?? previousXp + xpGain;
    const scoreDelta = previousScore != null ? pct - previousScore : null;
    const levelBefore = inferLevelBefore(adjustment, newLevel, profile?.level);
    return { previousScore, previousXp, totalXp, scoreDelta, levelBefore };
  }, [adjustment, newLevel, pct, profile?.level, profile?.stats?.readingXp, profile?.stats?.xp, xpGain]);

  const trendBars = useMemo(
    () => buildTrendBars(pct, sessionMeta.previousScore),
    [pct, sessionMeta.previousScore, scoreReplay],
  );
  const prevBars = useMemo(
    () =>
      sessionMeta.previousScore != null
        ? buildTrendBars(sessionMeta.previousScore, sessionMeta.previousScore - 12)
        : undefined,
    [sessionMeta.previousScore, scoreReplay],
  );

  const xpBars = useMemo(() => {
    const from = sessionMeta.previousXp % 100;
    const to = sessionMeta.totalXp % 100;
    return buildTrendBars(to || 40, from || 20);
  }, [sessionMeta.previousXp, sessionMeta.totalXp]);

  const levelIdx = CEFR_LEVELS.indexOf((newLevel ?? levelLabel ?? 'A1') as (typeof CEFR_LEVELS)[number]);
  const levelBars = useMemo(
    () => buildTrendBars(Math.max(20, ((levelIdx + 1) / CEFR_LEVELS.length) * 100), 20),
    [levelIdx],
  );

  useEffect(() => {
    if (!diagnostic || savedRef.current) return;
    savedRef.current = true;
    saveLastReadingScore(pct);
    saveLastReadingXp(sessionMeta.totalXp);
  }, [diagnostic, pct, sessionMeta.totalXp]);

  const animatedPct = useCountUp(pct, 900, 120, revealIndex >= 0);
  const animatedXp = useCountUp(xpGain, 1000, 280, revealIndex >= 1);
  const animatedTotal = useCountUp(sessionMeta.totalXp, 1100, 400, revealIndex >= 2);

  const replayScore = useCallback(() => setScoreReplay((n) => n + 1), []);

  const cycleSkill = useCallback(() => {
    if (skillBreakdown.length <= 1) return;
    setActiveSkill((i) => (i + 1) % skillBreakdown.length);
  }, [skillBreakdown.length]);

  useEffect(() => {
    if (skillBreakdown.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveSkill((i) => (i + 1) % skillBreakdown.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [skillBreakdown.length]);

  if (!diagnostic) return null;

  const levelAfter = newLevel ?? levelLabel ?? '-';
  const isLevelUp = adjustment === 'levelUp';
  const isLevelDown = adjustment === 'levelDown';

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
              className="min-w-0 px-2 text-xs sm:px-3 sm:text-sm"
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
              onClick={() => router.push('/learn/lesson?mode=placement&fresh=1')}
            >
              <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.25} />
              Retake
            </Button>
            <Button
              variant="pillPrimary"
              size="pill"
              className="min-w-0 px-2 text-xs sm:px-3 sm:text-sm"
              onClick={() => router.push('/learn/lesson?mode=practice')}
            >
              {t('common.continue')}
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="flex min-h-0 flex-1 flex-col justify-center overflow-x-hidden overflow-y-auto sm:justify-stretch sm:overflow-visible">
      <div
        className={cn(
          'flex flex-col gap-3 sm:grid sm:min-h-0 sm:flex-1 sm:grid-cols-2 sm:grid-rows-2 sm:gap-3',
        )}
      >
        <div className="grid shrink-0 grid-cols-2 gap-3 sm:contents">
        <BentoCard
          palette={pastel.accuracy}
          visible={revealIndex >= 0}
          delay={0}
          onClick={replayScore}
          className="sm:col-start-1 sm:row-start-1"
        >
          <CardHeader icon={Target} label={t('results.accuracy')} palette={pastel.accuracy} />
          <CapsuleBars
            values={trendBars}
            compareValues={prevBars}
            palette={pastel.accuracy}
            visible={revealIndex >= 0}
          />
          <div className="mt-2 flex shrink-0 items-end justify-between gap-2">
            <p className={cn(`${bricolage.className} text-3xl font-bold tabular-nums sm:text-4xl`, pastel.accuracy.value)}>
              {animatedPct}
              <span className={cn('text-base font-semibold sm:text-lg', pastel.accuracy.label)}>%</span>
            </p>
            {sessionMeta.scoreDelta != null && revealIndex >= 1 && (
              <motion.span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums sm:text-xs',
                  sessionMeta.scoreDelta > 0 && 'bg-[#4A9B62]/20 text-[#2D6B40]',
                  sessionMeta.scoreDelta < 0 && pastel.accuracy.badgeDown,
                  sessionMeta.scoreDelta === 0 && 'bg-[#C96E48]/15 text-[#B86B45] dark:bg-[#D4845F]/20 dark:text-[#E8A882]',
                )}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={springIn}
              >
                {sessionMeta.scoreDelta > 0 && `+${sessionMeta.scoreDelta}%`}
                {sessionMeta.scoreDelta < 0 && `${sessionMeta.scoreDelta}%`}
                {sessionMeta.scoreDelta === 0 && t('results.same')}
              </motion.span>
            )}
          </div>
        </BentoCard>

        <BentoCard palette={pastel.mint} visible={revealIndex >= 1} delay={0.06} className="sm:col-start-2 sm:row-start-1">
          <CardHeader
            icon={Energy}
            label={t('results.xpGained')}
            palette={pastel.mint}
            trailing={
              <span className={cn('text-[10px] font-semibold tabular-nums sm:text-xs', pastel.mint.label)}>
                {animatedTotal} total
              </span>
            }
          />
          <CapsuleBars values={xpBars} palette={pastel.mint} visible={revealIndex >= 1} />
          <div className="mt-2 flex shrink-0 items-baseline gap-1">
            <motion.span
              className={cn(`${bricolage.className} text-3xl font-bold tabular-nums sm:text-4xl`, pastel.mint.value)}
              animate={revealIndex >= 1 ? { scale: [1, 1.05, 1] } : undefined}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <AnimatedText text={`+${animatedXp}`} remountOnChange={false} delayStep={0.015} />
            </motion.span>
            <span className={cn(`${inter.className} text-sm font-semibold`, pastel.mint.label)}>{t('common.xp')}</span>
          </div>
        </BentoCard>
        </div>

        <BentoCard palette={pastel.lavender} visible={revealIndex >= 1} delay={0.1} className="sm:col-start-1 sm:row-start-2">
          <CardHeader icon={Award} label={t('results.yourLevel')} palette={pastel.lavender} />
          <CapsuleBars values={levelBars} palette={pastel.lavender} visible={revealIndex >= 2} />
          <div className="mt-2 flex shrink-0 items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              {sessionMeta.levelBefore && sessionMeta.levelBefore !== levelAfter && (
                <>
                  <span
                    className={cn(
                      `${bricolage.className} text-lg font-semibold tabular-nums line-through opacity-40 sm:text-xl`,
                      pastel.lavender.value,
                    )}
                  >
                    {sessionMeta.levelBefore}
                  </span>
                  <ArrowRight className={cn('h-3.5 w-3.5 shrink-0', pastel.lavender.label)} strokeWidth={2.25} />
                </>
              )}
              <motion.span
                key={levelAfter}
                className={cn(`${bricolage.className} text-3xl font-bold tabular-nums sm:text-4xl`, pastel.lavender.value)}
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
                  <Award className={cn('h-4 w-4', pastel.lavender.label)} strokeWidth={2} />
                )}
              </motion.span>
            )}
          </div>
        </BentoCard>

        <BentoCard
          palette={pastel.peach}
          visible={revealIndex >= 2}
          delay={0.14}
          onClick={skillBreakdown.length > 1 ? cycleSkill : undefined}
          className="min-h-[16rem] sm:col-start-2 sm:row-start-2 sm:min-h-0"
        >
          <CardHeader
            icon={ChartBarIncreasing}
            label={skillBreakdown.length > 0 ? t('results.skills') : t('results.focusNext')}
            palette={pastel.peach}
            trailing={
              skillBreakdown.length > 1 ? (
                <span className={cn('text-[10px] font-medium sm:text-xs', pastel.peach.label)}>
                  {activeSkill + 1}/{skillBreakdown.length}
                </span>
              ) : null
            }
          />
          <AnimatedSkillPanel
            skillBreakdown={skillBreakdown}
            weakAreas={weakAreas}
            activeSkill={activeSkill}
            visible={revealIndex >= 3}
            palette={pastel.peach}
          />
        </BentoCard>
      </div>
      </div>
    </div>
  );
}
