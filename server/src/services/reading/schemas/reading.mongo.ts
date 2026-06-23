/** Reading module identifier — used on universal TefEvaluation records */
export const READING_MODULE = 'reading' as const;

export type ReadingModule = typeof READING_MODULE;

export const READING_EVALUATION_KINDS = ['placement', 'practice'] as const;

export type ReadingEvaluationKind = (typeof READING_EVALUATION_KINDS)[number];
