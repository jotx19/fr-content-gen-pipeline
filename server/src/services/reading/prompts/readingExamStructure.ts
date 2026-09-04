import type {
  ReadingModule,
  ReadingModuleInput,
} from './readingPractice.types.js';

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

/** Official TEF Canada compréhension écrite structure (40 Q, 60 min). */
export const TEF_READING_EXAM = {
  totalQuestions: 40,
  durationMinutes: 60,
  sectionCount: 7,
  optionsPerQuestion: 4,
} as const;

export type TefReadingSection = {
  code: string;
  key: string;
  titleFr: string;
  titleEn: string;
  examCount: number;
  practiceCount: number;
  type: string;
};

/**
 * Seven TEF sub-sections (2024+ format).
 * practiceCount scales a daily session (~35% of full exam).
 */
export const TEF_READING_SECTIONS: readonly TefReadingSection[] = [
  {
    code: 'A',
    key: 'short_documents',
    titleFr: 'Documents du quotidien',
    titleEn: 'Everyday documents',
    examCount: 7,
    practiceCount: 2,
    type: 'short_documents',
  },
  {
    code: 'B',
    key: 'sentence_gap',
    titleFr: 'Phrases à compléter',
    titleEn: 'Fill-in-the-blank sentences',
    examCount: 6,
    practiceCount: 2,
    type: 'sentence_gap',
  },
  {
    code: 'C',
    key: 'text_gap',
    titleFr: 'Textes à trous',
    titleEn: 'Fill-in-the-blank texts',
    examCount: 4,
    practiceCount: 1,
    type: 'text_gap',
  },
  {
    code: 'D',
    key: 'doc_info_match',
    titleFr: 'Association document–information',
    titleEn: 'Document-to-information match',
    examCount: 4,
    practiceCount: 1,
    type: 'doc_info_match',
  },
  {
    code: 'E',
    key: 'statement_graph',
    titleFr: 'Énoncé et graphique',
    titleEn: 'Statement and chart',
    examCount: 1,
    practiceCount: 1,
    type: 'statement_graph',
  },
  {
    code: 'F',
    key: 'admin_documents',
    titleFr: 'Documents administratifs et professionnels',
    titleEn: 'Administrative and professional documents',
    examCount: 10,
    practiceCount: 4,
    type: 'admin_documents',
  },
  {
    code: 'G',
    key: 'press_article',
    titleFr: 'Articles de presse',
    titleEn: 'Press articles',
    examCount: 8,
    practiceCount: 3,
    type: 'press_article',
  },
] as const;

export const TEF_PRACTICE_QUESTION_COUNT = TEF_READING_SECTIONS.reduce(
  (sum, s) => sum + s.practiceCount,
  0
);

/** Target questions per practice session (env `TEF_PRACTICE_COUNT`, default 40 = full exam). */
export function getTefPracticeQuestionCount() {
  const n = Number(process.env.TEF_PRACTICE_COUNT);
  if (Number.isFinite(n) && n > 0) return Math.floor(n);
  return TEF_READING_EXAM.totalQuestions;
}

export function isFullReadingExam() {
  return getTefPracticeQuestionCount() >= TEF_READING_EXAM.totalQuestions;
}

/** Per-section count for the current practice mode (full exam uses official examCount). */
export function sectionQuestionCount(section: TefReadingSection) {
  return isFullReadingExam() ? section.examCount : section.practiceCount;
}

export type ReadingLevelBand = 'beginner' | 'intermediate' | 'advanced';

function isCefrLevel(value: string): value is CefrLevel {
  return (CEFR_LEVELS as readonly string[]).includes(value);
}

export function normalizeCefrForReading(level: unknown): CefrLevel {
  const raw = String(level ?? 'B1').trim().toUpperCase();
  return isCefrLevel(raw) ? raw : 'B1';
}

export function readingLevelBand(level: unknown): ReadingLevelBand {
  const l = normalizeCefrForReading(level);
  if (l === 'A1' || l === 'A2') return 'beginner';
  if (l === 'C1' || l === 'C2') return 'advanced';
  return 'intermediate';
}

const LEVEL_GUIDANCE: Record<ReadingLevelBand, string> = {
  beginner:
    'CEFR A1–A2: short everyday texts (avis, horaires, menus), high-frequency vocabulary, simple sentence structures, concrete facts. Avoid literary style or complex subordinate clauses.',
  intermediate:
    'CEFR B1–B2: administrative and workplace documents, moderate-length passages, formal register, some inference. Match TEF Canada immigration prep difficulty.',
  advanced:
    'CEFR C1–C2: press articles, nuanced argumentation, idiomatic French, implicit meaning, longer complex sentences. Include professional and editorial tone.',
};

export function readingLevelGuidance(level: unknown): string {
  return LEVEL_GUIDANCE[readingLevelBand(level)];
}

export function sectionLabel(section: TefReadingSection, locale: 'en' | 'fr' = 'fr'): string {
  const title = locale === 'en' ? section.titleEn : section.titleFr;
  return `Section ${section.code} · ${title}`;
}

/** Stamp official TEF section metadata onto a practice module. */
export function withTefSection(module: ReadingModuleInput, sectionKey: string): ReadingModule {
  const section = TEF_READING_SECTIONS.find((s) => s.key === sectionKey);
  if (!section) {
    return {
      ...module,
      type: sectionKey,
      title: module.id,
    };
  }
  return {
    ...module,
    type: section.type,
    sectionCode: section.code,
    sectionTitle: section.titleFr,
    sectionTitleEn: section.titleEn,
    title: sectionLabel(section, 'fr'),
  };
}
