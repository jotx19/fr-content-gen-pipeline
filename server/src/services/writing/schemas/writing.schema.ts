import { z } from 'zod';
import { TEF_MODULES } from '../../../app/db/schemas/tefEvaluation.schema.js';

export const writingTaskModeSchema = z.enum(['fill_blanks', 'sentences', 'full']);

export const submitWritingSchema = z
  .object({
    text: z.string().max(8000).optional(),
    blanks: z.record(z.string(), z.string()).optional(),
    sentences: z.record(z.string(), z.string()).optional(),
  })
  .refine(
    (body) =>
      Boolean(body.text?.trim()) ||
      (body.blanks && Object.values(body.blanks).some((v) => v.trim())) ||
      (body.sentences && Object.values(body.sentences).some((v) => v.trim())),
    { message: 'Submit your answer before evaluation.' }
  );

export const writingEvaluationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export const writingExampleSchema = z.object({
  promptId: z.string().optional(),
});

export const selfSelectWritingLevelSchema = z.object({
  level: z.string().min(1),
});

export const writingPromptQuerySchema = z.object({
  topic: z.string().max(120).optional(),
  section: z.enum(['A', 'B']).optional(),
  refresh: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
});

export type SubmitWritingBody = z.infer<typeof submitWritingSchema>;
export type WritingExampleBody = z.infer<typeof writingExampleSchema>;
export type SelfSelectWritingLevelBody = z.infer<typeof selfSelectWritingLevelSchema>;

export const WRITING_CRITERIA_KEYS = [
  'content_coherence',
  'vocabulary',
  'language_accuracy',
  'task_fulfillment',
] as const;

export const evaluationModuleSchema = z.enum(TEF_MODULES);
