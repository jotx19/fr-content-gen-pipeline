// @ts-nocheck
import { wordCountBandForLevel } from '../../../content-pipeline/subagents/writing/writing.schemas.js';

export type WordCountRequirements = {
  minWords: number;
  maxWords: number;
  source: 'prompt' | 'level_fallback';
};

export type WordCountCompliance = {
  compliant: boolean;
  deviation: number;
  type: 'none' | 'under' | 'over';
};

export type WritingCriterionRow = {
  criterion: string;
  label: string;
  score: number;
  feedback: string;
};

export type WritingEvaluationLike = {
  criteria: WritingCriterionRow[];
  overallScore: number;
  summary: string;
  suggestions: string[];
};

const TASK_FULFILLMENT = 'task_fulfillment';
const LENGTH_WEIGHT = 0.35;
const QUALITY_WEIGHT = 1 - LENGTH_WEIGHT;

/** True when the prompt defines authoritative exam/task word limits. */
export function hasExplicitWordLimits(prompt: Record<string, unknown> | null | undefined) {
  if (!prompt || typeof prompt !== 'object') return false;
  const min = prompt.minWords;
  const max = prompt.maxWords;
  return (
    typeof min === 'number' &&
    Number.isFinite(min) &&
    typeof max === 'number' &&
    Number.isFinite(max) &&
    min >= 20 &&
    max >= min
  );
}

/**
 * Resolve word-count requirements for scoring.
 * Exam/TEF tasks: prompt.minWords / prompt.maxWords.
 * Generic practice: fallback to CEFR bands (prompt generation only).
 */
export function resolveWordCountRequirements(
  prompt: Record<string, unknown> | null | undefined,
  level: string
): WordCountRequirements {
  if (hasExplicitWordLimits(prompt)) {
    return {
      minWords: prompt.minWords as number,
      maxWords: prompt.maxWords as number,
      source: 'prompt',
    };
  }

  const band = wordCountBandForLevel(level);
  return {
    minWords: band.min,
    maxWords: band.max,
    source: 'level_fallback',
  };
}

export function assessWordCountCompliance(
  wordCount: number,
  minWords: number,
  maxWords: number
): WordCountCompliance {
  if (wordCount >= minWords && wordCount <= maxWords) {
    return { compliant: true, deviation: 0, type: 'none' };
  }

  if (wordCount < minWords) {
    return { compliant: false, deviation: minWords - wordCount, type: 'under' };
  }

  return { compliant: false, deviation: wordCount - maxWords, type: 'over' };
}

/** Length-only score (0–100). Does not affect vocabulary or accuracy. */
export function lengthScoreFromWordCount(
  wordCount: number,
  minWords: number,
  maxWords: number
) {
  const compliance = assessWordCountCompliance(wordCount, minWords, maxWords);
  if (compliance.compliant) return 100;

  const range = Math.max(maxWords - minWords, 1);
  const severity = Math.min(1, compliance.deviation / range);
  return Math.max(0, 100 - Math.round(severity * 50));
}

export function wordCountFeedback(
  compliance: WordCountCompliance,
  wordCount: number,
  minWords: number,
  maxWords: number
) {
  if (compliance.compliant) {
    return `Word count (${wordCount}) meets the task requirement (${minWords}–${maxWords} words).`;
  }

  if (compliance.type === 'under') {
    return `Word count (${wordCount}) is below the required minimum of ${minWords} words (${compliance.deviation} words short).`;
  }

  return `Word count (${wordCount}) exceeds the maximum of ${maxWords} words (${compliance.deviation} words over).`;
}

function weightedOverallScore(criteria: WritingCriterionRow[]) {
  const byKey = Object.fromEntries(criteria.map((c) => [c.criterion, c.score]));
  const score =
    (byKey.content_coherence ?? 0) * 0.2 +
    (byKey.vocabulary ?? 0) * 0.2 +
    (byKey.language_accuracy ?? 0) * 0.3 +
    (byKey.task_fulfillment ?? 0) * 0.3;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function mergeTaskFulfillmentFeedback(existing: string, lengthNote: string) {
  const stripped = existing
    .replace(/Word count\s*\([^)]*\)[^.]*\./gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  return stripped ? `${stripped} ${lengthNote}` : lengthNote;
}

/**
 * Apply deterministic word-count scoring to task_fulfillment only.
 * LLM task_fulfillment should cover instructions/tone/register — not length.
 */
export function applyWordCountToEvaluation(
  evaluation: WritingEvaluationLike,
  wordCount: number,
  prompt: Record<string, unknown> | null | undefined,
  level: string
): WritingEvaluationLike {
  const requirements = resolveWordCountRequirements(prompt, level);
  const compliance = assessWordCountCompliance(
    wordCount,
    requirements.minWords,
    requirements.maxWords
  );
  const lengthScore = lengthScoreFromWordCount(
    wordCount,
    requirements.minWords,
    requirements.maxWords
  );
  const lengthNote = wordCountFeedback(
    compliance,
    wordCount,
    requirements.minWords,
    requirements.maxWords
  );

  const criteria = evaluation.criteria.map((row) => ({ ...row }));
  const tfIndex = criteria.findIndex((c) => c.criterion === TASK_FULFILLMENT);
  if (tfIndex < 0) return evaluation;

  const llmTaskScore = criteria[tfIndex].score;

  let blendedTaskScore: number;
  if (compliance.compliant) {
    // In range: no length penalty on task fulfillment.
    blendedTaskScore = llmTaskScore;
  } else {
    blendedTaskScore = Math.round(
      QUALITY_WEIGHT * llmTaskScore + LENGTH_WEIGHT * lengthScore
    );
  }

  criteria[tfIndex] = {
    ...criteria[tfIndex],
    score: blendedTaskScore,
    feedback: mergeTaskFulfillmentFeedback(criteria[tfIndex].feedback, lengthNote),
  };

  return {
    ...evaluation,
    criteria,
    overallScore: weightedOverallScore(criteria),
  };
}
