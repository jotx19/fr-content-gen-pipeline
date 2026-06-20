import { z } from 'zod';

export const googleCredentialSchema = z.object({
  credential: z.string().min(1),
});

export type GoogleCredentialBody = z.infer<typeof googleCredentialSchema>;
