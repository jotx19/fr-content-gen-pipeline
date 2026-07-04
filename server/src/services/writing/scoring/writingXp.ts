// @ts-nocheck
import { CEFR_LEVELS } from '../../../content-pipeline/subagents/shared/reading.schemas.js';

/** XP required to reach each writing level (cumulative thresholds) */
export const WRITING_XP_THRESHOLDS: Record<string, number> = {
  A1: 0,
  A2: 80,
  B1: 200,
  B2: 380,
  C1: 600,
  C2: 850,
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

export function writingXpGain(overallScore: number, taskMode: string) {
  const base = Math.round(overallScore * 0.55);
  const bonus = taskMode === 'fill_blanks' ? 12 : taskMode === 'sentences' ? 18 : 25;
  return Math.max(8, base + bonus);
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
  const newLevel = writingLevelFromXp(newXp);
  const prevIdx = CEFR_LEVELS.indexOf(previousLevel);
  const newIdx = CEFR_LEVELS.indexOf(newLevel);

  if (newIdx > prevIdx) {
    return {
      adjustment: 'levelUp',
      newLevel,
      newXp,
      xpGain,
      reason: `Writing XP reached ${newXp} — unlocked ${newLevel} tasks`,
    };
  }

  if (newIdx < prevIdx) {
    return {
      adjustment: 'levelDown',
      newLevel,
      newXp,
      xpGain,
      reason: `Writing XP adjusted to ${newLevel} band`,
    };
  }

  const progress = xpProgressForLevel(newXp, newLevel);
  return {
    adjustment: 'same',
    newLevel,
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
