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

export type WritingPrompt = {
  id: string;
  title: string;
  instructions: string;
  prompt: string;
  examSection?: 'A' | 'B';
  taskType: string;
  register: string;
  level: string;
  topic: string;
  minWords: number;
  maxWords: number;
};

export type WritingCriterionScore = {
  criterion: WritingCriterionKey;
  label: string;
  score: number;
  feedback: string;
};

export type WritingProfile = {
  level: string;
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
  level: string;
  prompt: WritingPrompt;
  criteria: WritingCriterion[];
  ready: boolean;
};

export type WritingExampleResponse = {
  promptId: string;
  exampleAnswer: string;
  wordCount: number;
  notes: string | null;
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
};
