/** Cumulative XP (reading + writing) → overall CEFR display level */
export const OVERALL_XP_THRESHOLDS: Record<string, number> = {
  A1: 0,
  A2: 100,
  B1: 280,
  B2: 520,
  C1: 820,
  C2: 1200,
};

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function overallLevelFromXp(totalXp: number) {
  const xp = Math.max(0, Math.round(totalXp));
  let level: (typeof LEVELS)[number] = 'A1';
  for (const step of LEVELS) {
    if (xp >= (OVERALL_XP_THRESHOLDS[step] ?? 0)) level = step;
  }
  return level;
}

export function overallXpProgress(totalXp: number) {
  const xp = Math.max(0, Math.round(totalXp));
  const level = overallLevelFromXp(xp);
  const idx = LEVELS.indexOf(level as (typeof LEVELS)[number]);
  const current = OVERALL_XP_THRESHOLDS[level] ?? 0;
  const nextLevel = idx >= 0 && idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
  const next = nextLevel ? OVERALL_XP_THRESHOLDS[nextLevel] : null;

  const band = next != null ? Math.max(1, next - current) : 1;
  const intoBand = next != null ? clamp((xp - current) / band, 0, 1) : 1;

  return {
    level,
    totalXp: xp,
    currentThreshold: current,
    nextLevel,
    nextThreshold: next,
    xpToNext: next != null ? Math.max(0, next - xp) : 0,
    /** 0–1 progress within the current level band */
    bandProgress: intoBand,
  };
}

/**
 * Overall level + confidence from combined reading/writing XP and recent performance.
 * Confidence rises as you earn XP toward the next level and as recent scores improve.
 */
export function overallLevelAndConfidence({
  readingXp = 0,
  writingXp = 0,
  lastScorePct = null,
}: {
  readingXp?: number;
  writingXp?: number;
  /** Latest reading or writing score 0–100 */
  lastScorePct?: number | null;
}) {
  const totalXp = Math.max(0, readingXp) + Math.max(0, writingXp);
  const progress = overallXpProgress(totalXp);

  // Recent quality: map score into 0–1 (neutral 0.5 when unknown)
  const scorePart =
    lastScorePct != null && Number.isFinite(lastScorePct)
      ? clamp(lastScorePct / 100, 0, 1)
      : 0.5;

  // ~70% XP band progress, ~30% recent score → confidence climbs with XP + improvement
  const confidence = clamp(0.3 + progress.bandProgress * 0.55 + scorePart * 0.15, 0.3, 0.98);

  return {
    ...progress,
    confidence,
  };
}
