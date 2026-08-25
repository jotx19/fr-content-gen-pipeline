export type PublicQuestion = {
  id?: string;
  question: string;
  options: string[];
  skillTag?: string;
};

export type ReadingModuleType =
  | 'short_documents'
  | 'sentence_gap'
  | 'text_gap'
  | 'doc_info_match'
  | 'statement_graph'
  | 'admin_documents'
  | 'press_article'
  | 'passage_mcq'
  | 'finding_info'
  | 'mcq_set';

export type PublicReadingModule = {
  id: string;
  type: ReadingModuleType | string;
  title: string;
  sectionCode?: string;
  sectionTitle?: string;
  sectionTitleEn?: string;
  passage?: string;
  items: PublicQuestion[];
};

export type TefStats = {
  totalSessions: number;
  totalQuestions: number;
  streakDays: number;
  xp: number;
  readingXp?: number;
  writingXp?: number;
};

export type TefProfile = {
  level: string;
  confidence?: number | null;
  weakAreas?: string[];
  summary?: string;
  onboardedAt?: string | null;
  practiceReady?: boolean;
  stats?: TefStats;
  lastEvaluation?: {
    id: string;
    kind: string;
    overallAccuracy: number;
    levelAfter?: string | null;
    summary?: string;
    createdAt?: string;
  } | null;
};

export type PracticeBatch = {
  level: string;
  weakAreas: string[];
  topic?: string;
  examFormat?: string;
  levelBand?: string;
  sectionCount?: number;
  modules?: PublicReadingModule[];
  questions: PublicQuestion[];
  ready: boolean;
};

export type TefDiagnostic = {
  overallAccuracy?: number;
  skillBreakdown?: { skillTag: string; correct: number; total: number; accuracy: number }[];
  weakAreas?: string[];
  adjustment?: string;
  newLevel?: string;
  summary?: string;
  estimatedLevel?: string;
  confidence?: number;
  evaluationId?: string;
  profile?: TefProfile;
};

export type OnboardStartResponse = { questions: PublicQuestion[] };

export type PracticePrefetchStatus =
  | 'already_ready'
  | 'in_flight'
  | 'started'
  | 'cooldown'
  | 'no_profile'
  | 'no_level';

export type PracticePrefetchResponse = {
  ok: boolean;
  status: PracticePrefetchStatus;
};

export type CheckAnswerResponse = {
  correct: boolean;
  correctIndex: number;
};
