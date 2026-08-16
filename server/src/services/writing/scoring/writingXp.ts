// @ts-nocheck
import { CEFR_LEVELS } from '../../../content-pipeline/subagents/shared/reading.schemas.js';

/**
 * Cumulative XP to unlock each writing level.
 * Tuned for very slow progression (~15–40 solid sessions per band).
 */
export const WRITING_XP_THRESHOLDS: Record<string, number> = {
  A1: 0,
  A2: 280,
  B1: 750,
  B2: 1600,
  C1: 3000,
  C2: 5200,
};

export function normalizeCefrLevel(level: string | null | undefined) {
  if (level == null || String(level).trim() === '') return null;
  return String(level).trim().toUpperCase();
}

export function taskModeForWritingLevel(level: string): 'fill_blanks' | 'sentences' | 'full' {
  const normalized = normalizeCefrLevel(level) ?? 'A1';
  if (normalized === 'A1') return 'fill_blanks';
  if (normalized === 'A2') return 'sentences';
  return 'full';
}

/** Small XP per session so levels climb slowly */
export function writingXpGain(overallScore: number, taskMode: string) {
  const base = Math.round(overallScore * 0.1);
  const bonus = taskMode === 'fill_blanks' ? 2 : taskMode === 'sentences' ? 3 : 4;
  return Math.max(2, base + bonus);
}

export function writingLevelFromXp(xp: number) {
  let level = 'A1';
  for (const step of CEFR_LEVELS) {
    if (xp >= (WRITING_XP_THRESHOLDS[step] ?? 0)) level = step;
  }
  return level;
}

export function xpProgressForLevel(xp: number, level: string) {
  const idx = CEFR_LEVELS.indexOf(level);
  const current = WRITING_XP_THRESHOLDS[level] ?? 0;
  const nextLevel = idx >= 0 && idx < CEFR_LEVELS.length - 1 ? CEFR_LEVELS[idx + 1] : null;
  const next = nextLevel ? WRITING_XP_THRESHOLDS[nextLevel] : null;
  return {
    xp,
    level,
    currentThreshold: current,
    nextLevel,
    nextThreshold: next,
    xpToNext: next != null ? Math.max(0, next - xp) : 0,
  };
}

export function adjustWritingLevelFromXp(
  previousLevel: string,
  previousXp: number,
  xpGain: number
) {
  const newXp = previousXp + xpGain;
  const xpLevel = writingLevelFromXp(newXp);
  const prevIdx = CEFR_LEVELS.indexOf(previousLevel);
  const xpIdx = CEFR_LEVELS.indexOf(xpLevel);

  // Only level up from XP — never auto-demote (manual level picks stay until XP catches up)
  if (xpIdx > prevIdx) {
    return {
      adjustment: 'levelUp',
      newLevel: xpLevel,
      newXp,
      xpGain,
      reason: `Writing XP reached ${newXp} — unlocked ${xpLevel} tasks`,
    };
  }

  const progress = xpProgressForLevel(newXp, previousLevel);
  return {
    adjustment: 'same',
    newLevel: previousLevel,
    newXp,
    xpGain,
    reason:
      progress.nextLevel != null
        ? `${progress.xpToNext} writing XP to reach ${progress.nextLevel}`
        : 'Maximum writing level reached',
  };
}

export function seedWritingLevel(_readingLevel: string | null | undefined) {
  return 'A1';
}
