export type WritingTaskMode = 'fill_blanks' | 'sentences' | 'full';

export type WritingCriterionKey =
  | 'content_coherence'
  | 'vocabulary'
  | 'language_accuracy'
  | 'task_fulfillment';

export type WritingCriterion = {
  key: WritingCriterionKey;
  label: string;
  description: string;
};

export type WritingBlank = {
  id: string;
  hint?: string;
};

export type WritingParagraphPart =
  | { type: 'text'; value: string }
  | { type: 'blank'; id: string; hint?: string };

export type WritingSentencePrompt = {
  id: string;
  prompt: string;
  minWords: number;
  maxWords: number;
};

export type WritingPrompt = {
  id: string;
  title: string;
  instructions: string;
  prompt: string;
  taskMode?: WritingTaskMode;
  examSection?: 'A' | 'B';
  taskType: string;
  register: string;
  level: string;
  topic: string;
  minWords: number;
  maxWords: number;
  paragraphParts?: WritingParagraphPart[];
  blanks?: WritingBlank[];
  sentencePrompts?: WritingSentencePrompt[];
};

export type WritingXpProgress = {
  xp: number;
  level: string;
  currentThreshold: number;
  nextLevel: string | null;
  nextThreshold: number | null;
  xpToNext: number;
};

export type WritingCriterionScore = {
  criterion: WritingCriterionKey;
  label: string;
  score: number;
  feedback: string;
};

export type WritingProfile = {
  readingLevel?: string;
  level: string;
  writingLevel: string;
  writingXp?: number;
  writingProgress?: WritingXpProgress;
  taskMode?: WritingTaskMode;
  writingReady: boolean;
  pendingPrompt: WritingPrompt | null;
  writingScoreHistory: number[];
  criteria: WritingCriterion[];
  lastEvaluation: {
    id: string;
    module: string;
    overallScore: number;
    criteriaBreakdown?: WritingCriterionScore[];
    summary?: string;
    createdAt?: string;
  } | null;
};

export type WritingPromptResponse = {
  readingLevel?: string;
  level: string;
  writingLevel?: string;
  taskMode?: WritingTaskMode;
  prompt: WritingPrompt;
  criteria: WritingCriterion[];
  ready: boolean;
};

export type WritingExampleResponse = {
  promptId: string;
  exampleAnswer: string;
  wordCount: number;
  notes: string | null;
  blankAnswers?: Record<string, string>;
};

export type WritingSubmitPayload = {
  text?: string;
  blanks?: Record<string, string>;
  sentences?: Record<string, string>;
};

export type WritingSubmitResponse = {
  module: string;
  evaluationId: string;
  overallScore: number;
  overallAccuracy: number;
  criteria: WritingCriterionScore[];
  weakAreas: string[];
  suggestions: string[];
  summary: string;
  adjustment?: string;
  newLevel?: string;
  reason?: string;
  wordCount: number;
  xpGain?: number;
  writingXp?: number;
  writingProgress?: WritingXpProgress;
  taskMode?: WritingTaskMode;
};
