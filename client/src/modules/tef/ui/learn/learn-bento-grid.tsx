"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, ChartNoAxesCombined, Loader2, Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { bricolage, inter } from "@/lib/fonts";
import { BrandLogo } from "@/components/logo";
import { cn } from "@/lib/utils";

export type LearnBentoData = {
  firstName?: string;
  level: string;
  confidence?: number | null;
  summary?: string;
  streak: number;
  xp: number;
  lastScore?: number | null;
  lastKind?: string;
  lastLevel?: string;
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
        className={`${bricolage.className} text-[2.25rem] font-semibold leading-none tracking-tight text-[#DADADA] [text-shadow:0_1px_0_rgba(255,255,255,0.9),0_-1px_0_rgba(0,0,0,0.06)] dark:text-white/25 dark:[text-shadow:none] sm:text-[3.25rem] md:text-[3.75rem]`}
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
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-0.5">
        <p
          className={`${bricolage.className} text-[2rem] font-semibold leading-none tracking-tight text-[#C9A227] [text-shadow:0_1px_0_rgba(255,255,255,0.55),0_-1px_0_rgba(0,0,0,0.12)] dark:text-[#A8860D] dark:[text-shadow:0_1px_0_rgba(255,255,255,0.08),0_-1px_0_rgba(0,0,0,0.4)] sm:text-[2.75rem] md:text-[3rem]`}
        >
          {xp}
        </p>
        <Plus
          className={cn("mb-1 h-5 w-5", streakGoldText)}
          strokeWidth={2.25}
        />
        <span className={cn(streakGoldText, "text-[1.75rem] font-semibold")}>
          XP
        </span>
      </div>
      <p
        className={`${inter.className} mt-1 text-[9px] uppercase font-medium tracking-wide text-neutral-400 dark:text-white/40`}
      >
        reading xp
      </p>
    </div>
  );
}

function StreakDayBars({ streak }: { streak: number }) {
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
                      aria-label={`Day ${dayNumber}`}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={6}>
                    Day {dayNumber}
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
  const {
    firstName,
    level,
    confidence,
    summary,
    streak,
    xp,
    lastScore,
    lastKind,
    lastLevel,
    practiceReady,
    placementMode,
    onStartPractice,
    onStartWriting,
    onStartPlacement,
  } = data;

  const confidenceDisplay =
    confidence != null ? `${Math.round(confidence * 100)}%` : "—";

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
                From placement
              </h2>
              <div
                className={`${bricolage.className} mt-2 flex flex-wrap items-center gap-2 text-2xl font-semibold text-[#675549] dark:text-white sm:text-[1.75rem]`}
              >
                <HeroArrowIcon />
                <span>your level</span>
              </div>
              <p
                className={`${inter.className} mt-auto max-w-md pt-6 text-sm leading-relaxed text-[#675549]/90 dark:text-white/80 sm:text-[15px]`}
              >
                A short reading test sets your CEFR level and unlocks adaptive
                MCQ practice and TCF-style writing.
              </p>
            </>
          ) : (
            <>
              <h2
                className={`${bricolage.className} text-2xl font-semibold leading-tight text-[#675549] dark:text-white sm:text-[1.75rem] md:text-[1.75rem]`}
              >
                Bonjour{firstName ? `, ${firstName}` : ""}!
              </h2>
              <div
                className={`${bricolage.className} mt-2 flex flex-wrap items-center gap-2 text-2xl font-semibold text-[#675549] dark:text-white sm:text-[1.75rem]`}
              >
                <HeroArrowIcon />
              </div>
              <p
                className={`${inter.className} mt-auto max-w-md pt-6 text-sm leading-relaxed text-[#675549]/90 dark:text-white/80 sm:text-[15px]`}
              >
                {summary ||
                  "Adaptive placement, daily practice, and full progress reports — everything you need to reach your French goals."}
              </p>
            </>
          )}
        </div>

        <div className="mt-4 border-t border-[#675549]/15 pt-4 dark:border-white/10">
          <div
            className={`${inter.className} flex items-center justify-between text-[11px] text-[#675549]/80 dark:text-white/70 sm:text-xs`}
          >
            <BrandLogo
              href="/learn"
              iconSize={24}
              textClassName="text-sm font-semibold text-[#675549] dark:text-white"
              className="gap-1.5"
            />
            {!placementMode && onStartPlacement && (
              <button
                type="button"
                onClick={onStartPlacement}
                className={`${inter.className} inline-flex h-9 items-center rounded-full border border-[#675549]/25 bg-[#675549]/10 px-4 text-xs font-medium text-[#675549] transition-colors hover:border-[#675549]/40 hover:bg-[#675549]/15 dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:border-white/40 dark:hover:bg-white/15 sm:text-sm`}
              >
                Evaluate level
              </button>
            )}
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
          Level {level}
        </span>
        <EmbossedStat value={confidenceDisplay} label="Confidence" />
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

      {/* Right — last session + actions */}
      <div
        className={cn(
          "col-span-2 flex min-h-[280px] flex-col justify-between rounded-[28px] p-6 ring-1 ring-black/[0.04] sm:min-h-[320px] sm:rounded-[32px] sm:p-8 dark:ring-white/[0.06]",
          "md:col-span-5 md:col-start-8 md:row-span-2 md:row-start-1 md:h-full md:min-h-0",
          panelBg,
        )}
      >
        <div className="flex flex-1 flex-col">
          <h3
            className={`${bricolage.className} text-xl font-semibold text-neutral-900 dark:text-white sm:text-2xl`}
          >
            Last session
          </h3>
          {lastScore != null ? (
            <div className="mt-auto flex items-end justify-between gap-4 pt-6">
              <div>
                <p className="text-5xl font-extrabold leading-none text-[#58cc02] sm:text-6xl">
                  {lastScore}%
                </p>
                <p
                  className={`${inter.className} mt-2 text-sm font-semibold capitalize text-neutral-500 dark:text-white/70`}
                >
                  {lastKind ?? "practice"}
                </p>
              </div>
              <span
                className={`${inter.className} mb-1 shrink-0 rounded-full bg-neutral-100 px-3.5 py-1.5 text-xs font-bold text-neutral-700 dark:bg-white/10 dark:text-white`}
              >
                {lastLevel ?? level}
              </span>
            </div>
          ) : (
            <p
              className={`${inter.className} mt-auto pt-6 text-sm leading-relaxed text-neutral-500 dark:text-white/70`}
            >
              {placementMode
                ? "Complete placement to see your first score here."
                : "Finish a lesson to track your progress."}
            </p>
          )}
        </div>

        <div
          className={`${inter.className} mt-8 space-y-2.5 border-t border-neutral-100 pt-5 dark:border-white/10`}
        >
          {!placementMode && (
            <button
              type="button"
              onClick={onStartPractice}
              disabled={!practiceReady}
              className="flex w-full items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3 text-left text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
            >
              <span>
                {practiceReady ? "Start reading lesson" : "Preparing lesson…"}
              </span>
              {practiceReady ? (
                <ArrowRight className="h-4 w-4" />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={placementMode ? onStartPlacement : onStartWriting}
            className="flex w-full items-center justify-between rounded-2xl bg-neutral-900 px-4 py-3 text-left text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-[#1C1C1C]"
          >
            <span>
              {placementMode ? "Start placement" : "Expression écrite"}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
