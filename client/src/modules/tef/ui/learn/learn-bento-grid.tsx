"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, ChartNoAxesCombined, Loader2, Plus } from "@/components/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { bricolage, inter } from "@/lib/fonts";
import { glassButtonPill, glassCard, glassTopOnDark } from "@/lib/glass-button-styles";
import { useI18n } from "@/lib/i18n";
import { PlanPillBadge } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  loadLastReadingXp,
  saveLastReadingXp,
} from "@/lib/tef-session-storage";
import { cn } from "@/lib/utils";

export type LearnBentoData = {
  firstName?: string;
  level: string;
  confidence?: number | null;
  summary?: string;
  streak: number;
  xp: number;
  planBadge?: { label: string; variant: 'pro' | 'trial' } | null;
  showUpgradeToPro?: boolean;
  onUpgradeToPro?: () => void;
  practiceReady?: boolean;
  placementMode?: boolean;
  onStartPractice?: () => void;
  onStartWriting?: () => void;
  onStartPlacement?: () => void;
};

type LearnBentoGridProps = {
  data: LearnBentoData;
  className?: string;
};

const panelBg = "bg-[#FCFCFC] dark:bg-[#1C1C1C]";
const streakGold = "bg-[#C9A227] dark:bg-[#A8860D]";
const streakGoldText = "text-[#C9A227] dark:text-[#A8860D]";

const goldenXpDigitClass = cn(
  bricolage.className,
  "text-[2rem] font-semibold leading-none tracking-tight text-[#C9A227] [text-shadow:0_1px_0_rgba(255,255,255,0.55),0_-1px_0_rgba(0,0,0,0.12)] dark:text-[#A8860D] dark:[text-shadow:0_1px_0_rgba(255,255,255,0.08),0_-1px_0_rgba(0,0,0,0.4)] sm:text-[2.75rem] md:text-[3rem]",
);

type ExitItem = {
  id: number;
  char: string;
  exitY: number;
};

let digitAnimId = 0;

function DigitCell({
  char,
  isDigit,
  className,
  enterStiffness = 170,
  enterDamping = 10,
  exitStiffness = 170,
  exitDamping = 15,
  direction = "dynamic",
  enterY = 32,
  enterBlur = 52,
  enterScale = 0.7,
}: {
  char: string;
  isDigit: boolean;
  className?: string;
  enterStiffness?: number;
  enterDamping?: number;
  exitStiffness?: number;
  exitDamping?: number;
  direction?: "dynamic" | "up" | "down";
  enterY?: number;
  enterBlur?: number;
  enterScale?: number;
}) {
  const [exitQueue, setExitQueue] = useState<ExitItem[]>([]);
  const prevCharRef = useRef(char);
  const isFirstRender = useRef(true);

  const springConfig = { stiffness: enterStiffness, damping: enterDamping };
  const y = useSpring(0, springConfig);
  const opacity = useSpring(1, springConfig);
  const scale = useSpring(1, springConfig);
  const blur = useSpring(0, springConfig);
  const filter = useTransform(blur, (v) => `blur(${v}px)`);

  useEffect(() => {
    if (!isDigit) return;

    const prev = prevCharRef.current;
    prevCharRef.current = char;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (char === prev || !/\d/.test(prev)) return;

    const up =
      direction === "dynamic" ? Number(char) > Number(prev) : direction === "up";

    const id = digitAnimId++;
    setExitQueue((q) => {
      const next = [...q, { id, char: prev, exitY: up ? -enterY : enterY }];
      return next.length > 3 ? next.slice(-3) : next;
    });

    y.jump(up ? enterY : -enterY);
    opacity.jump(0);
    scale.jump(enterScale);
    blur.jump(enterBlur);

    y.set(0);
    opacity.set(1);
    scale.set(1);
    blur.set(0);
  }, [char, isDigit, direction, enterY, enterBlur, enterScale, y, opacity, scale, blur]);

  if (!isDigit) {
    return <span className={className}>{char}</span>;
  }

  return (
    <div
      className={cn(
        "relative grid place-items-center [&>*]:col-start-1 [&>*]:row-start-1",
        className,
      )}
    >
      <AnimatePresence>
        {exitQueue.map(({ id, char: exitChar, exitY }) => (
          <motion.span
            key={id}
            aria-hidden
            className={className}
            initial={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
            animate={{ opacity: 0, scale: 0.7, filter: "blur(10px)", y: exitY }}
            transition={{
              type: "spring",
              stiffness: exitStiffness,
              damping: exitDamping,
            }}
            onAnimationComplete={() =>
              setExitQueue((q) => q.filter((item) => item.id !== id))
            }
          >
            {exitChar}
          </motion.span>
        ))}
      </AnimatePresence>
      <motion.span className={className} style={{ opacity, scale, filter, y }}>
        {char}
      </motion.span>
    </div>
  );
}

function AnimateDigits({
  value,
  gap = 2,
  className,
  digitClassName,
  animationDelay = 80,
}: {
  value: string;
  gap?: number;
  className?: string;
  digitClassName?: string;
  animationDelay?: number;
}) {
  const [displayedValue, setDisplayedValue] = useState(value);
  const pendingQueue = useRef<string[]>([]);
  const isAnimating = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const displayedRef = useRef(value);

  const processQueue = () => {
    if (pendingQueue.current.length === 0) {
      isAnimating.current = false;
      return;
    }

    isAnimating.current = true;
    const next = pendingQueue.current.shift()!;
    displayedRef.current = next;
    setDisplayedValue(next);

    timerRef.current = setTimeout(processQueue, animationDelay);
  };

  useEffect(() => {
    if (value === displayedRef.current) return;

    pendingQueue.current.push(value);

    if (!isAnimating.current) {
      processQueue();
    }
  }, [value]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const chars = displayedValue.split("");

  return (
    <div className={cn("flex items-center tabular-nums", className)} style={{ gap }}>
      {chars.map((char, i) => (
        <DigitCell
          key={i}
          char={char}
          isDigit={/\d/.test(char)}
          className={digitClassName}
        />
      ))}
    </div>
  );
}

function HeroArrowIcon() {
  return (
    <span className="inline-flex h-7 w-9 items-center justify-center rounded-full border border-[#675549]/40 dark:border-white/30 sm:h-8 sm:w-10">
      <ArrowRight
        className="h-3.5 w-3.5 text-[#675549] dark:text-white"
        strokeWidth={2}
      />
    </span>
  );
}

function EmbossedStat({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex flex-col justify-end">
      <div className="mb-3 h-px w-full bg-[#DADADA] dark:bg-white/20" />
      <p
        className={`${bricolage.className} text-[2.25rem] font-semibold leading-none tracking-tight dark: [text-shadow:0_1px_0_rgba(255,255,255,0.9),0_-1px_0_rgba(0,0,0,0.06)] dark:text-white/25 dark:[text-shadow:none] sm:text-[3.25rem] md:text-[3.75rem]`}
      >
        {value}
      </p>
      <p
        className={`${inter.className} mt-2 text-[11px] font-medium uppercase tracking-wide text-neutral-500 dark:text-white/60`}
      >
        {label}
      </p>
    </div>
  );
}

function GoldenXpStat({ xp }: { xp: number }) {
  const { t } = useI18n();
  const [displayXp, setDisplayXp] = useState(() => loadLastReadingXp() ?? xp);

  useEffect(() => {
    const previous = loadLastReadingXp() ?? xp;
    setDisplayXp(previous);

    if (previous === xp) {
      saveLastReadingXp(xp);
      return;
    }

    const timer = setTimeout(() => setDisplayXp(xp), 650);
    return () => clearTimeout(timer);
  }, [xp]);

  useEffect(() => {
    if (displayXp !== xp) return;
    saveLastReadingXp(xp);
  }, [displayXp, xp]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-0.5">
        <AnimateDigits
          value={String(displayXp)}
          digitClassName={goldenXpDigitClass}
          animationDelay={100}
        />
        <Plus
          className={cn("mb-1 h-5 w-5", streakGoldText)}
          strokeWidth={2.25}
        />
        <span className={cn(streakGoldText, "text-[1.75rem] font-semibold")}>
          {t("common.xp")}
        </span>
      </div>
      <p
        className={`${inter.className} mt-1 text-[9px] uppercase font-medium tracking-wide text-neutral-400 dark:text-white/40`}
      >
        {t("learn.overallXp")}
      </p>
    </div>
  );
}

function StreakDayBars({ streak }: { streak: number }) {
  const { t } = useI18n();
  const scrollRef = useRef<HTMLDivElement>(null);
  const displayStreak = Math.max(streak, 1);
  const totalDays = Math.max(21, displayStreak + 7);
  const active = Math.min(displayStreak, totalDays);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = 0;
  }, [streak, totalDays]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex w-full flex-col gap-2.5">
        <div
          ref={scrollRef}
          className="w-full overflow-x-auto rounded-2xl bg-[#F0F0F0]/90 px-3 py-3 [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-white/[0.06] sm:px-4 sm:py-3.5 [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex min-w-min items-end gap-2.5 sm:gap-3">
            {Array.from({ length: totalDays }, (_, i) => {
              const filled = i < active;
              const dayNumber = i + 1;
              return (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "w-4 shrink-0 cursor-default rounded-[5px] transition-all sm:w-5",
                        filled
                          ? cn("h-16 sm:h-[4.5rem]", streakGold)
                          : "h-10 bg-[#E0E0E0] dark:bg-white/10 sm:h-10",
                      )}
                      aria-label={t("learn.day", { n: dayNumber })}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={6}>
                    {t("learn.day", { n: dayNumber })}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function BentoXpStreakPanel({ xp, streak }: { xp: number; streak: number }) {
  return (
    <div className="flex h-full min-h-0 flex-col px-3 py-4 sm:px-8 sm:py-8">
      <GoldenXpStat xp={xp} />
      <div className="mt-4 sm:mt-4 md:mt-6">
        <StreakDayBars streak={streak} />
      </div>
    </div>
  );
}

export function LearnBentoGrid({ data, className }: LearnBentoGridProps) {
  const { t } = useI18n();
  const {
    firstName,
    level,
    confidence,
    summary,
    streak,
    xp,
    planBadge,
    showUpgradeToPro,
    onUpgradeToPro,
    practiceReady,
    placementMode,
    onStartPractice,
    onStartWriting,
    onStartPlacement,
  } = data;

  const confidenceDisplay =
    confidence != null ? `${Math.round(confidence * 100)}%` : "-";

  return (
    <section
      className={cn(
        "grid w-full gap-4 sm:gap-5",
        /* mobile: 2-col — hero + last session full width; level | xp side by side */
        "grid-cols-2 auto-rows-auto",
        /* desktop: original 12-col bento */
        "md:grid-cols-12 md:grid-rows-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:h-[78vh] md:max-h-[800px] md:min-h-[480px]",
        className,
      )}
    >
      {/* Top-left — hero copy (wide, row 1) */}
      <div
        className={cn(
          "col-span-2 flex min-h-[220px] flex-col justify-between rounded-[28px] px-6 pb-6 pt-4 sm:min-h-[260px] sm:rounded-[32px] sm:px-8 sm:pb-8 sm:pt-5",
          "md:col-span-7 md:col-start-1 md:row-start-1 md:h-full md:min-h-0",
          panelBg,
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          {placementMode ? (
            <>
              <h2
                className={`${bricolage.className} text-2xl font-semibold leading-tight text-[#675549] dark:text-white sm:text-[1.75rem]`}
              >
                {t("learn.fromPlacement")}
              </h2>
              <div
                className={`${bricolage.className} mt-2 flex flex-wrap items-center gap-2 text-2xl font-semibold text-[#675549] dark:text-white sm:text-[1.75rem]`}
              >
                <HeroArrowIcon />
                <span>{t("learn.yourLevel")}</span>
              </div>
              <p
                className={`${inter.className} mt-auto max-w-md pt-6 text-sm leading-relaxed text-[#675549]/90 dark:text-white/80 sm:text-[15px]`}
              >
                {t("learn.placementBody")}
              </p>
            </>
          ) : (
            <>
              <h2
                className={`${bricolage.className} text-2xl font-semibold leading-tight text-[#675549] dark:text-white sm:text-[1.75rem] md:text-[1.75rem]`}
              >
                {t("learn.hello", { name: firstName ? `, ${firstName}` : "" })}
              </h2>
              <p
                className={`${inter.className} mt-auto max-w-md pt-6 text-sm leading-relaxed text-[#675549]/90 dark:text-white/80 sm:text-[15px]`}
              >
                {summary || t("learn.defaultSummary")}
              </p>
            </>
          )}
        </div>

        <div className="mt-4 border-t border-[#675549]/15 pt-4 dark:border-white/10">
          <div
            className={`${inter.className} flex items-center justify-between gap-3 text-[11px] text-[#675549]/80 dark:text-white/70 sm:text-xs`}
          >
            <div className="flex min-w-0 items-center">
              {planBadge ? (
                <PlanPillBadge
                  label={planBadge.label}
                  variant={planBadge.variant}
                  size="md"
                />
              ) : null}
            </div>
            {showUpgradeToPro && onUpgradeToPro ? (
              <Button
                type="button"
                size="sm"
                onClick={onUpgradeToPro}
                className={cn(
                  inter.className,
                  'h-8 shrink-0 rounded-full text-xs font-semibold text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:bg-[#1A3D2E]/90',
                  'bg-[#1A3D2E]',
                )}
              >
                {t('dashboard.upgradeToPro')}
              </Button>
            ) : !placementMode && onStartPlacement ? (
              <button
                type="button"
                onClick={onStartPlacement}
                className={cn(
                  inter.className,
                  glassButtonPill,
                  'inline-flex h-8 shrink-0 items-center justify-center rounded-full px-4 text-xs font-semibold text-[#675549] dark:text-white/90',
                )}
              >
                {t("learn.evaluateLevel")}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Bottom-left — level + embossed confidence (row 2) */}
      <div
        className={cn(
          "col-span-1 flex min-h-[200px] flex-col justify-between rounded-[28px] p-4 sm:min-h-[220px] sm:rounded-[32px] sm:p-6",
          "md:col-span-3 md:col-start-1 md:row-start-2 md:h-full md:min-h-0",
          panelBg,
        )}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F2F2F2] text-neutral-500 dark:bg-white/10 dark:text-white/70">
          <ChartNoAxesCombined className="h-4 w-4" strokeWidth={2.5} />
        </div>
        <span>
          {t("learn.level", { level })}
        </span>
        <EmbossedStat value={confidenceDisplay} label={t("learn.confidence")} />
      </div>

      {/* Bottom-center — golden XP + streak bars (row 2) */}
      <div
        className={cn(
          "col-span-1 min-h-[200px] overflow-hidden rounded-[28px] sm:min-h-[220px] sm:rounded-[32px]",
          "md:col-span-4 md:col-start-4 md:row-start-2 md:h-full md:min-h-0",
          panelBg,
        )}
      >
        <BentoXpStreakPanel xp={xp} streak={streak} />
      </div>

      {/* Right — reading & writing (equal halves) */}
      <div
        className={cn(
          "col-span-2 flex min-h-[280px] flex-col rounded-[28px] p-5 ring-1 ring-black/[0.04] sm:min-h-[320px] sm:rounded-[32px] sm:p-6 dark:ring-white/[0.06]",
          "md:col-span-5 md:col-start-8 md:row-span-2 md:row-start-1 md:h-full md:min-h-0",
          panelBg,
        )}
      >
        <div className="shrink-0 pb-4 sm:pb-5">
          <h3
            className={`${bricolage.className} text-xl font-semibold text-neutral-900 dark:text-white sm:text-2xl`}
          >
            {t("learn.practice")}
          </h3>
          <p
            className={`${inter.className} mt-2 max-w-[20rem] text-sm leading-relaxed text-neutral-500 dark:text-white/70`}
          >
            {placementMode
              ? t("learn.placementFirst")
              : t("learn.jumpIn")}
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 sm:gap-4">
          {placementMode ? (
            <button
              type="button"
              onClick={onStartPlacement}
              className={cn(
                "flex h-full min-h-[140px] flex-1 flex-col items-start justify-between rounded-[22px] px-5 py-5 text-left sm:rounded-[26px] sm:px-6 sm:py-6",
                "bg-neutral-900 text-white dark:bg-white dark:text-[#1C1C1C]",
                glassTopOnDark,
              )}
            >
              <span
                className={`${bricolage.className} text-3xl font-semibold tracking-tight sm:text-4xl`}
              >
                {t("learn.placement")}
              </span>
              <span className="inline-flex items-center gap-2 text-sm font-medium opacity-80">
                {t("learn.startPlacement")}
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onStartPractice}
                disabled={!practiceReady}
                className={cn(
                  "flex min-h-[100px] flex-1 flex-col items-start justify-between rounded-[22px] px-5 py-5 text-left sm:min-h-0 sm:rounded-[26px] sm:px-6 sm:py-6",
                  glassCard,
                  "text-neutral-900 disabled:opacity-50 dark:text-white",
                )}
              >
                <span
                  className={`${bricolage.className} text-3xl font-semibold tracking-tight sm:text-4xl md:text-[2.75rem]`}
                >
                  {t("common.reading")}
                </span>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 dark:text-white/70">
                  {practiceReady ? (
                    <>
                      {t("learn.startLesson")}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      {t("learn.preparing")}
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </>
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={onStartWriting}
                className={cn(
                  "flex min-h-[100px] flex-1 flex-col items-start justify-between rounded-[22px] px-5 py-5 text-left sm:min-h-0 sm:rounded-[26px] sm:px-6 sm:py-6",
                  glassCard,
                  "text-[#1C1C1C] dark:text-white",
                )}
              >
                <span
                  className={`${bricolage.className} text-3xl font-semibold tracking-tight sm:text-4xl md:text-[2.75rem]`}
                >
                  {t("common.writing")}
                </span>
                <span className="inline-flex items-center gap-2 text-sm font-medium opacity-80">
                  {t("learn.writtenExpression")}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
