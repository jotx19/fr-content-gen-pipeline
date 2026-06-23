import { z } from 'zod';
import { TEF_MODULES } from '../../../app/db/schemas/tefEvaluation.schema.js';

export const submitAnswersSchema = z.object({
  userAnswers: z.array(z.number().int().min(0).max(3)),
});

export const checkAnswerSchema = z.object({
  kind: z.enum(['placement', 'practice']),
  questionIndex: z.number().int().min(0),
  userAnswer: z.number().int().min(0).max(3),
});

export const evaluationHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  module: z.enum(TEF_MODULES).optional(),
});

export type SubmitAnswersBody = z.infer<typeof submitAnswersSchema>;
export type CheckAnswerBody = z.infer<typeof checkAnswerSchema>;
