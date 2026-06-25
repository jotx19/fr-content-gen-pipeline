// @ts-nocheck
import { z } from 'zod';

export const tefWritingSectionSchema = z.enum(['A', 'B']);

export const writingPromptSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  instructions: z.string().min(1),
  prompt: z.string().min(1),
  examSection: tefWritingSectionSchema,
  taskType: z.enum(['message', 'letter', 'email', 'essay', 'article']),
  register: z.enum(['formel', 'neutre']),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  topic: z.string().min(1),
  minWords: z.number().int().min(20),
  maxWords: z.number().int().min(20),
  rubricHints: z.array(z.string()).optional(),
});

export const writingPromptOutputSchema = z.object({
  prompt: writingPromptSchema,
});

export const writingEvaluationOutputSchema = z.object({
  criteria: z
    .array(
      z.object({
        criterion: z.enum([
          'content_coherence',
          'vocabulary',
          'language_accuracy',
          'task_fulfillment',
        ]),
        label: z.string().min(1),
        score: z.number().min(0).max(100),
        feedback: z.string().min(1),
      })
    )
    .length(4),
  overallScore: z.number().min(0).max(100),
  summary: z.string().min(1),
  suggestions: z.array(z.string()).min(1).max(6),
});

export const writingExampleOutputSchema = z.object({
  exampleAnswer: z.string().min(1),
  wordCount: z.number().int().min(1),
  notes: z.string().optional(),
});

/** CEFR-level word bands — used for generic prompt generation and scoring fallback when minWords/maxWords are absent. */
export const WORD_COUNT_BY_LEVEL: Record<string, { min: number; max: number }> = {
  A1: { min: 40, max: 60 },
  A2: { min: 60, max: 90 },
  B1: { min: 120, max: 180 },
  B2: { min: 180, max: 250 },
  C1: { min: 250, max: 350 },
  C2: { min: 300, max: 400 },
};

export function wordCountBandForLevel(level: string) {
  return WORD_COUNT_BY_LEVEL[level] ?? WORD_COUNT_BY_LEVEL.B1;
}

const CRITERION_ORDER = [
  'content_coherence',
  'vocabulary',
  'language_accuracy',
  'task_fulfillment',
] as const;

const CRITERION_LABELS: Record<(typeof CRITERION_ORDER)[number], string> = {
  content_coherence: 'Content / Coherence',
  vocabulary: 'Vocabulary',
  language_accuracy: 'Language Accuracy',
  task_fulfillment: 'Task Fulfillment',
};

function clampScore(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Coerce common LLM shape drift before zod validation. */
export function normalizeWritingEvaluationOutput(parsed: Record<string, unknown>) {
  if (!parsed || typeof parsed !== 'object') return parsed;

  const rawCriteria = Array.isArray(parsed.criteria) ? parsed.criteria : [];
  const criteria = CRITERION_ORDER.map((key, index) => {
    const row =
      rawCriteria.find(
        (c) =>
          typeof c === 'object' &&
          c !== null &&
          String((c as Record<string, unknown>).criterion ?? '')
            .toLowerCase()
            .includes(key.split('_')[0])
      ) ?? rawCriteria[index];

    const item = (row && typeof row === 'object' ? row : {}) as Record<string, unknown>;
    return {
      criterion: key,
      label: String(item.label ?? CRITERION_LABELS[key]),
      score: clampScore(item.score),
      feedback: String(item.feedback ?? 'No feedback provided.'),
    };
  });

  const weighted =
    criteria[0].score * 0.2 +
    criteria[1].score * 0.2 +
    criteria[2].score * 0.3 +
    criteria[3].score * 0.3;

  const overallScore = clampScore(parsed.overallScore ?? weighted);
  const suggestions = Array.isArray(parsed.suggestions)
    ? parsed.suggestions.map(String).filter(Boolean).slice(0, 6)
    : [];

  return {
    ...parsed,
    criteria,
    overallScore,
    summary: String(parsed.summary ?? 'Writing evaluation complete.'),
    suggestions:
      suggestions.length > 0 ? suggestions : ['Review grammar, vocabulary, and task requirements.'],
  };
}
