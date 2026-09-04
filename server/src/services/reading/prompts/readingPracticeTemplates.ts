import { createHash } from 'node:crypto';
import { shuffleMcqOptions } from '../../../content-pipeline/subagents/shared/reading.normalize.js';
import {
  readingLevelBand,
  TEF_PRACTICE_QUESTION_COUNT,
  TEF_READING_EXAM,
  TEF_READING_SECTIONS,
  isFullReadingExam,
} from './readingExamStructure.js';
import { READING_SESSIONS_BY_BAND } from './readingPracticeSessions.js';
import { assembleFullReadingExam } from './readingFullExamAssembler.js';
import type {
  FlatReadingItem,
  ReadingModule,
  ReadingPracticePickResult,
} from './readingPractice.types.js';

export { TEF_READING_EXAM, TEF_READING_SECTIONS, TEF_PRACTICE_QUESTION_COUNT };

function pickBatchIndex(seed: string, batchCount: number): number {
  if (!batchCount) return 0;
  const hash = createHash('sha256').update(seed).digest();
  return hash[0] % batchCount;
}

export function flattenReadingModules(modules: ReadingModule[] = []): FlatReadingItem[] {
  return modules.flatMap((mod) =>
    (mod.items ?? []).map((item) => ({
      ...item,
      moduleId: mod.id,
      moduleType: mod.type,
      moduleTitle: mod.title,
      sectionCode: mod.sectionCode,
      sectionTitle: mod.sectionTitle,
    }))
  );
}

/** @deprecated Prefer pickReadingPracticeSession(seed, level) */
export function pickReadingPracticeTemplate(seed = '', count = 3) {
  const session = pickReadingPracticeSession(seed, 'B1');
  const flat = flattenReadingModules(session.modules);
  const size = Math.min(Math.max(Number(count) || 3, 1), flat.length);
  return flat.slice(0, size);
}

/**
 * Pick a TEF-format reading practice session.
 * Full exam mode (40 Q): all 7 sections at official counts — freetcf.com-style mock.
 * Mini mode (14 Q): shortened daily session.
 */
export function pickReadingPracticeSession(
  seed = '',
  level = 'B1',
  weakAreas: string[] = []
): ReadingPracticePickResult {
  if (isFullReadingExam()) {
    return assembleFullReadingExam(seed, level, weakAreas);
  }

  const band = readingLevelBand(level);
  const pool = READING_SESSIONS_BY_BAND[band] ?? READING_SESSIONS_BY_BAND.intermediate;

  const weakKey = Array.isArray(weakAreas) && weakAreas.length ? weakAreas.join(',') : '';
  const index = pickBatchIndex(`${seed}:${band}:${weakKey}`, pool.length);
  const session = pool[index] ?? pool[0];

  return {
    topic: session.topic,
    examFormat: 'TEF Canada · compréhension écrite',
    levelBand: band,
    targetLevel: level,
    sectionCount: TEF_READING_SECTIONS.length,
    questionCount: TEF_PRACTICE_QUESTION_COUNT,
    fullExamQuestionCount: TEF_READING_EXAM.totalQuestions,
    modules: session.modules.map((m) => ({
      ...m,
      items: (m.items ?? []).map((item) => shuffleMcqOptions({ ...item })),
    })),
  };
}
