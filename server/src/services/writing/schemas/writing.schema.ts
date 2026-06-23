import { z } from 'zod';
import { TEF_MODULES } from '../../../app/db/schemas/tefEvaluation.schema.js';

export const submitWritingSchema = z.object({
  text: z.string().min(10).max(8000),
});

export const writingEvaluationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export const writingExampleSchema = z.object({
  promptId: z.string().optional(),
});

export const writingPromptQuerySchema = z.object({
  topic: z.string().max(120).optional(),
  refresh: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
});

export type SubmitWritingBody = z.infer<typeof submitWritingSchema>;
export type WritingExampleBody = z.infer<typeof writingExampleSchema>;

export const WRITING_CRITERIA_KEYS = [
  'content_coherence',
  'vocabulary',
  'language_accuracy',
  'task_fulfillment',
] as const;

export const evaluationModuleSchema = z.enum(TEF_MODULES);
