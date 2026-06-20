// @ts-nocheck
import { z } from 'zod';

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const skillTagSchema = z.enum([
  'grammaire',
  'vocabulaire',
  'compréhension écrite',
  'compréhension orale',
  'expression écrite',
  'expression orale',
]);

export const mcqSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string().min(1)).length(4),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(1),
  skillTag: skillTagSchema,
});

export const placementQuestionSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  options: z.array(z.string().min(1)).length(4),
  correctIndex: z.number().int().min(0).max(3),
  skillTag: skillTagSchema,
  explanation: z.string().optional(),
  register: z.enum(['formel', 'neutre', 'quotidien']).optional(),
});

export const placementBatchSchema = z.object({
  questions: z.array(placementQuestionSchema).min(5).max(8),
});

export const mcqBatchOutputSchema = z.object({
  questions: z.array(mcqSchema).min(1).max(20),
});

export const evaluatorOutputSchema = z.object({
  results: z.array(
    z.object({
      questionIndex: z.number().int().min(0),
      correct: z.boolean(),
      skillTag: skillTagSchema,
      explanation: z.string().min(1),
    })
  ),
});

export const levelAdjustmentSchema = z.enum(['levelUp', 'same', 'levelDown']);
