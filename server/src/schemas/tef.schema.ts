import { z } from 'zod';

export const submitAnswersSchema = z.object({
  userAnswers: z.array(z.number().int().min(0).max(3)),
});

export const evaluationHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type SubmitAnswersBody = z.infer<typeof submitAnswersSchema>;
