// @ts-nocheck
import { CEFR_LEVELS } from '../../../content-pipeline/subagents/shared/reading.schemas.js';

export const WRITING_CRITERIA = [
  {
    key: 'content_coherence',
    label: 'Content/Coherence',
    description: 'Clarity, logical flow, and relevance to the topic.',
  },
  {
    key: 'vocabulary',
    label: 'Vocabulary',
    description: 'Range, precision, and appropriateness of word choice.',
  },
  {
    key: 'language_accuracy',
    label: 'Language Accuracy',
    description: 'Grammar, spelling, and punctuation correctness.',
  },
  {
    key: 'task_fulfillment',
    label: 'Task Fulfillment',
    description: 'Adherence to instructions, tone, and register (word count scored separately).',
  },
] as const;

export type WritingCriterionKey = (typeof WRITING_CRITERIA)[number]['key'];

/** Aggregate criterion scores (0–100) into a 0–1 overall accuracy for universal evaluation storage */
export function aggregateWritingScore(criteria: { score: number }[]) {
  if (!criteria.length) return 0;
  const avg = criteria.reduce((acc, c) => acc + c.score, 0) / criteria.length;
  return Math.round((avg / 100) * 1000) / 1000;
}

/** Overall score 0–100 for client display */
export function overallWritingScore(criteria: { score: number }[]) {
  if (!criteria.length) return 0;
  return Math.round(criteria.reduce((acc, c) => acc + c.score, 0) / criteria.length);
}

export function criteriaToSkillBreakdown(criteria: { criterion: string; score: number }[]) {
  return criteria.map((c) => ({
    skillTag: c.criterion,
    correct: c.score,
    total: 100,
    accuracy: c.score / 100,
  }));
}

export function weakAreasFromCriteria(criteria: { criterion: string; score: number }[]) {
  return [...criteria]
    .sort((a, b) => a.score - b.score)
    .filter((c) => c.score < 70)
    .map((c) => c.criterion)
    .slice(0, 3);
}

/** CEFR estimate from writing overall score (0–100), aligned with TCF expression écrite bands */
export function levelFromWritingScore(overallScore: number) {
  const s = overallScore;
  let level = 'A2';
  let confidence = 0.6;

  if (s >= 88) {
    level = 'C1';
    confidence = 0.85;
  } else if (s >= 78) {
    level = 'B2';
    confidence = 0.8;
  } else if (s >= 65) {
    level = 'B1';
    confidence = 0.75;
  } else if (s >= 50) {
    level = 'A2';
    confidence = 0.7;
  } else {
    level = 'A1';
    confidence = 0.65;
  }

  if (!CEFR_LEVELS.includes(level)) level = 'B1';
  return { level, confidence };
}

/** Consecutive strong submissions required before CEFR level increases */
export const WRITING_LEVEL_UP_SESSIONS = 4;
/** Every submission in the window must meet this score (0–100) */
export const WRITING_LEVEL_UP_MIN_SCORE = 88;
/** Average across the window must also meet this score (0–100) */
export const WRITING_LEVEL_UP_AVG_SCORE = 86;

/** Consecutive weak submissions before level decreases */
export const WRITING_LEVEL_DOWN_SESSIONS = 2;
/** Each score in the down window must stay below this (0–100) */
export const WRITING_LEVEL_DOWN_MAX_SCORE = 44;
/** Single very weak submission can trigger level down */
export const WRITING_LEVEL_DOWN_SINGLE_SCORE = 32;

export function adjustWritingLevel(currentLevel: string, scoreHistory: number[], currentScore: number) {
  const allScores = [...scoreHistory, currentScore].filter(
    (s) => typeof s === 'number' && Number.isFinite(s) && s >= 0 && s <= 100
  );
  const idx = CEFR_LEVELS.indexOf(currentLevel);
  if (idx < 0) return { adjustment: 'same', newLevel: currentLevel, reason: 'Unknown level' };

  const recentForUp = allScores.slice(-WRITING_LEVEL_UP_SESSIONS);
  const avgUp =
    recentForUp.length > 0 ? recentForUp.reduce((a, b) => a + b, 0) / recentForUp.length : 0;

  if (
    recentForUp.length >= WRITING_LEVEL_UP_SESSIONS &&
    recentForUp.every((s) => s >= WRITING_LEVEL_UP_MIN_SCORE) &&
    avgUp >= WRITING_LEVEL_UP_AVG_SCORE &&
    idx < CEFR_LEVELS.length - 1
  ) {
    return {
      adjustment: 'levelUp',
      newLevel: CEFR_LEVELS[idx + 1],
      reason: `${WRITING_LEVEL_UP_SESSIONS} consecutive strong writing scores (each ≥${WRITING_LEVEL_UP_MIN_SCORE}%, avg ${Math.round(avgUp)}%)`,
    };
  }

  const recentForDown = allScores.slice(-WRITING_LEVEL_DOWN_SESSIONS);

  if (idx > 0) {
    if (
      recentForDown.length >= WRITING_LEVEL_DOWN_SESSIONS &&
      recentForDown.every((s) => s <= WRITING_LEVEL_DOWN_MAX_SCORE)
    ) {
      return {
        adjustment: 'levelDown',
        newLevel: CEFR_LEVELS[idx - 1],
        reason: `${WRITING_LEVEL_DOWN_SESSIONS} consecutive weak writing scores (≤${WRITING_LEVEL_DOWN_MAX_SCORE}%)`,
      };
    }

    if (currentScore <= WRITING_LEVEL_DOWN_SINGLE_SCORE) {
      return {
        adjustment: 'levelDown',
        newLevel: CEFR_LEVELS[idx - 1],
        reason: `Writing score ${currentScore}% is well below expectations for ${currentLevel}`,
      };
    }
  }

  if (allScores.length < WRITING_LEVEL_UP_SESSIONS) {
    return {
      adjustment: 'same',
      newLevel: currentLevel,
      reason: `Need ${WRITING_LEVEL_UP_SESSIONS - allScores.length} more strong writing submission(s) before level can increase`,
    };
  }

  return { adjustment: 'same', newLevel: currentLevel, reason: 'Level maintained based on recent writing' };
}

export function buildWritingSummary({
  overallScore,
  level,
  weakAreas,
}: {
  overallScore: number;
  level: string;
  weakAreas: string[];
}) {
  const labels = Object.fromEntries(WRITING_CRITERIA.map((c) => [c.key, c.label]));
  const focus =
    weakAreas.length > 0
      ? ` Focus: ${weakAreas.map((k) => labels[k] ?? k).join(', ')}.`
      : '';
  return `Writing score ${overallScore}/100. Estimated level: ${level}.${focus}`;
}

export function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
