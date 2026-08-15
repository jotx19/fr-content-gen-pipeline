import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z.string().trim().max(200).optional(),
  content: z.unknown().optional(),
  visibility: z.enum(['private', 'public']).optional(),
});

export const updateNoteSchema = z.object({
  title: z.string().trim().max(200).optional(),
  content: z.unknown().optional(),
  visibility: z.enum(['private', 'public']).optional(),
  excerpt: z.string().max(500).optional(),
});

export type CreateNoteBody = z.infer<typeof createNoteSchema>;
export type UpdateNoteBody = z.infer<typeof updateNoteSchema>;
