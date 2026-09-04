import { createHash } from 'node:crypto';
import { shuffleMcqOptions } from '../../../content-pipeline/subagents/shared/reading.normalize.js';
import {
  readingLevelBand,
  TEF_READING_EXAM,
  TEF_READING_SECTIONS,
  withTefSection,
  type ReadingLevelBand,
} from './readingExamStructure.js';
import { READING_SESSIONS_BY_BAND } from './readingPracticeSessions.js';
import type { ReadingMcqItem, ReadingModule, ReadingPracticePickResult } from './readingPractice.types.js';

type PooledItem = {
  item: ReadingMcqItem;
  passage?: string;
};

function hashSeed(seed: string) {
  return createHash('sha256').update(seed).digest();
}

/** Deterministic shuffle — same seed → same order (fair rotation across users). */
function seededShuffle<T>(items: T[], seed: string): T[] {
  if (items.length <= 1) return [...items];
  const out = [...items];
  const hash = hashSeed(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = hash[i % hash.length] % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function bandsForPool(levelBand: ReadingLevelBand): ReadingLevelBand[] {
  if (levelBand === 'beginner') return ['beginner', 'intermediate'];
  if (levelBand === 'advanced') return ['advanced', 'intermediate'];
  return ['intermediate', 'beginner', 'advanced'];
}

function poolSectionItems(levelBand: ReadingLevelBand, sectionKey: string): PooledItem[] {
  const pool: PooledItem[] = [];
  for (const band of bandsForPool(levelBand)) {
    for (const session of READING_SESSIONS_BY_BAND[band] ?? []) {
      for (const mod of session.modules) {
        if (mod.type !== sectionKey) continue;
        for (const item of mod.items ?? []) {
          pool.push({ item, passage: mod.passage });
        }
      }
    }
  }
  return pool;
}

function buildSectionModule(
  sectionKey: string,
  count: number,
  pool: PooledItem[],
  seed: string
): ReadingModule {
  const section = TEF_READING_SECTIONS.find((s) => s.key === sectionKey)!;
  const shuffled = seededShuffle(pool, `${seed}:${section.code}`);
  const picked: PooledItem[] = [];
  for (let i = 0; picked.length < count; i++) {
    if (!shuffled.length) break;
    picked.push(shuffled[i % shuffled.length]!);
  }

  const passages = [...new Set(picked.map((p) => p.passage).filter(Boolean))];
  const passage =
    passages.length === 0
      ? undefined
      : passages.length === 1
        ? passages[0]
        : passages.join('\n\n———\n\n');

  const items = picked.map((p, index) =>
    shuffleMcqOptions({
      ...p.item,
      id: `${section.code.toLowerCase()}-${index + 1}`,
    })
  );

  return withTefSection(
    {
      id: `full-${section.key}`,
      passage,
      items,
    },
    section.key
  );
}

/**
 * Build a full TEF / TCF-style reading mock: 40 MCQs across 7 official sections.
 * Pulls from the static session bank (passages + 4-option MCQs) — no LLM credits needed.
 */
export function assembleFullReadingExam(
  seed = '',
  level = 'B1',
  weakAreas: string[] = []
): ReadingPracticePickResult {
  const band = readingLevelBand(level);
  const weakKey = weakAreas.length ? weakAreas.join(',') : '';
  const examSeed = `${seed}:full-exam:${band}:${weakKey}`;

  const modules = TEF_READING_SECTIONS.map((section) => {
    const pool = poolSectionItems(band, section.key);
    return buildSectionModule(section.key, section.examCount, pool, examSeed);
  });

  const questionCount = modules.reduce((sum, m) => sum + (m.items?.length ?? 0), 0);

  return {
    topic: 'Compréhension écrite · examen complet (40 questions)',
    examFormat: 'TEF Canada / TCF · compréhension écrite',
    levelBand: band,
    targetLevel: level,
    sectionCount: TEF_READING_SECTIONS.length,
    questionCount,
    fullExamQuestionCount: TEF_READING_EXAM.totalQuestions,
    modules,
  };
}
