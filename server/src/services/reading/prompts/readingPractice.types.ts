import type { ReadingLevelBand } from './readingExamStructure.js';

export type ReadingMcqItem = {
  id: string;
  question: string;
  options: [string, string, string, string] | string[];
  correctIndex: number;
  skillTag: string;
  explanation?: string;
};

export type ReadingModuleInput = {
  id: string;
  passage?: string;
  items: ReadingMcqItem[];
};

export type ReadingModule = ReadingModuleInput & {
  type: string;
  sectionCode?: string;
  sectionTitle?: string;
  sectionTitleEn?: string;
  title: string;
};

export type ReadingPracticeSession = {
  topic: string;
  modules: ReadingModule[];
};

export type ReadingSessionsByBand = Record<ReadingLevelBand, ReadingPracticeSession[]>;

export type FlatReadingItem = ReadingMcqItem & {
  moduleId: string;
  moduleType: string;
  moduleTitle: string;
  sectionCode?: string;
  sectionTitle?: string;
};

export type ReadingPracticePickResult = {
  topic: string;
  examFormat: string;
  levelBand: ReadingLevelBand;
  targetLevel: string;
  sectionCount: number;
  questionCount: number;
  fullExamQuestionCount: number;
  modules: ReadingModule[];
};
