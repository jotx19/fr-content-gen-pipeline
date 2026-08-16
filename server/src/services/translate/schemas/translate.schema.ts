import { z } from 'zod';

export const translateBodySchema = z.object({
  text: z.string().min(1).max(5000),
  sourceLang: z.enum(['EN', 'FR']).optional().default('EN'),
  targetLang: z.enum(['EN', 'FR']).optional().default('FR'),
});

export type TranslateBody = z.infer<typeof translateBodySchema>;
