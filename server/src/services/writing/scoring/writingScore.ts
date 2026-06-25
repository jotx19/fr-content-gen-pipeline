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

export function adjustWritingLevel(currentLevel: string, scoreHistory: number[], currentScore: number) {
  const normalized = [...scoreHistory, currentScore].map((s) => s / 100);
  const recent = normalized.slice(-3);
  const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const idx = CEFR_LEVELS.indexOf(currentLevel);
  if (idx < 0) return { adjustment: 'same', newLevel: currentLevel, reason: 'Unknown level' };

  if (recent.length >= 2 && avg >= 0.82 && idx < CEFR_LEVELS.length - 1) {
    return {
      adjustment: 'levelUp',
      newLevel: CEFR_LEVELS[idx + 1],
      reason: `Strong writing scores (avg ${Math.round(avg * 100)}%) over recent sessions`,
    };
  }

  if (recent.length >= 1 && currentScore < 45 && idx > 0) {
    return {
      adjustment: 'levelDown',
      newLevel: CEFR_LEVELS[idx - 1],
      reason: `Writing score ${currentScore}% suggests revisiting ${CEFR_LEVELS[idx - 1]} tasks`,
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
