// @ts-nocheck
import { z } from 'zod';

export const writingPromptSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  instructions: z.string().min(1),
  prompt: z.string().min(1),
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
