// @ts-nocheck
import { TefProfile, TefEvaluation, isMongoReady } from '../../../app/db/mongo.js';
import { runGenerationGraph, runEvaluationGraph } from '../../../content-pipeline/agent/graph.js';
import {
  publicQuestions,
  levelFromPlacement,
  buildEnglishSummary,
} from '../../../content-pipeline/core/tefScore.js';
import { storeSessionMemory } from '../../../content-pipeline/memory/rag.js';
import { getInFlight, setInFlight, hasInFlight } from '../../../content-pipeline/agent/session.js';
import { config } from '../../../config.js';
import { getLatestEvaluation, getEvaluationHistory } from '../../../app/services/userService.js';
import { READING_MODULE } from '../schemas/reading.mongo.js';
import type { TefModule } from '../../../app/db/schemas/tefEvaluation.schema.js';

const TOPIC_BY_SKILL: Record<string, string> = {
  grammaire: 'formal French grammar',
  vocabulaire: 'administrative and professional vocabulary',
  'compréhension écrite': 'official documents and written comprehension',
  'compréhension orale': 'announcements and oral comprehension',
  'expression écrite': 'formal letter writing',
  'expression orale': 'professional speaking situations',
};

function requireMongo() {
  if (!isMongoReady()) {
    throw new Error('MongoDB is not available — TEF state requires a database connection');
  }
}

function profileFromDoc(doc: Record<string, unknown> | null, lastEval?: Record<string, unknown> | null) {
  if (!doc?.level) return null;
  const pending = doc.pendingPractice as { questions?: unknown[] } | undefined;
  const stats = (doc.stats as Record<string, number>) ?? {};
  const readingXp = stats.readingXp ?? stats.xp ?? 0;
  return {
    level: doc.level,
    confidence: doc.confidence ?? null,
    weakAreas: doc.weakAreas ?? [],
    summary: doc.summary ?? '',
    onboardedAt:
      (doc.onboardedAt as Date)?.toISOString?.() ?? (doc.onboardedAt as string) ?? null,
    practiceReady: Boolean(pending?.questions?.length),
    stats: {
      totalSessions: stats.totalSessions ?? 0,
      totalQuestions: stats.totalQuestions ?? 0,
      streakDays: stats.streakDays ?? 0,
      xp: readingXp,
      readingXp,
      writingXp: stats.writingXp ?? 0,
    },
    lastEvaluation: lastEval
      ? {
          id: String(lastEval._id),
          module: lastEval.module ?? READING_MODULE,
          kind: lastEval.kind,
          overallAccuracy: lastEval.overallAccuracy,
          levelAfter: lastEval.levelAfter,
          summary: lastEval.summary,
          createdAt: (lastEval.createdAt as Date)?.toISOString?.() ?? lastEval.createdAt,
        }
      : null,
  };
}

function pickTopic(weakAreas: string[] = []) {
  for (const tag of weakAreas) {
    if (TOPIC_BY_SKILL[tag]) return TOPIC_BY_SKILL[tag];
  }
  return 'daily life and administration in Canada';
}

function practiceResponse(doc: Record<string, unknown>) {
  const pending = doc.pendingPractice as { questions: unknown[]; topic?: string };
  return {
    level: doc.level,
    weakAreas: doc.weakAreas ?? [],
    topic: pending?.topic ?? pickTopic((doc.weakAreas as string[]) ?? []),
    questions: publicQuestions(pending.questions),
    ready: true,
  };
}

async function persistEvaluation(
  userId: string,
  data: {
    kind: 'placement' | 'practice';
    evaluation: Record<string, unknown>;
    questions: unknown[];
    userAnswers: number[];
    levelBefore?: string | null;
    levelAfter?: string | null;
    adjustment?: string | null;
    reason?: string | null;
    confidence?: number | null;
    summary: string;
    topic?: string | null;
  }
) {
  const evalDoc = await TefEvaluation.create({
    userId,
    module: READING_MODULE,
    kind: data.kind,
    overallAccuracy: data.evaluation.overallAccuracy,
    skillBreakdown: data.evaluation.skillBreakdown,
    weakAreas: data.evaluation.weakAreas,
    userAnswers: data.userAnswers,
    results: data.evaluation.results,
    questions: publicQuestions(data.questions),
    levelBefore: data.levelBefore ?? null,
    levelAfter: data.levelAfter ?? null,
    adjustment: data.adjustment ?? null,
    reason: data.reason ?? null,
    confidence: data.confidence ?? null,
    summary: data.summary,
    topic: data.topic ?? null,
  });

  const questionCount = data.questions.length;
  const xpGain = Math.round((data.evaluation.overallAccuracy as number) * 100) + questionCount * 5;

  await TefProfile.findOneAndUpdate(
    { userId },
    {
      $set: { lastEvaluationId: evalDoc._id, updatedAt: new Date() },
      $inc: {
        'stats.totalSessions': 1,
        'stats.totalQuestions': questionCount,
        'stats.readingXp': xpGain,
        'stats.xp': xpGain,
      },
    }
  );

  return evalDoc;
}

async function generatePracticeBatch(userId: string, { level, weakAreas }: { level: string; weakAreas: string[] }) {
  const topic = pickTopic(weakAreas);
  const { questions } = await runGenerationGraph({
    userId,
    action: 'practice',
    level,
    weakAreas,
    topic,
    subagentName: 'mcqGenerator',
    subagentInput: { level, weakAreas, topic, count: config.tefPracticeCount },
  });

  const pendingPractice = { questions, topic, createdAt: new Date() };
  await TefProfile.findOneAndUpdate(
    { userId },
    { $set: { pendingPractice, updatedAt: new Date() } }
  );

  console.log(`[reading] practice batch ready (${questions.length} q) for ${userId.slice(0, 8)}`);
  return pendingPractice;
}

async function ensurePracticeBatch(userId: string, doc: Record<string, unknown>) {
  const pending = doc.pendingPractice as { questions?: unknown[] } | undefined;
  if (pending?.questions?.length) return pending;

  const existing = getInFlight(userId);
  if (existing) return existing;

  return setInFlight(
    userId,
    generatePracticeBatch(userId, {
      level: doc.level as string,
      weakAreas: (doc.weakAreas as string[]) ?? [],
    })
  );
}

export function prefetchPractice(userId: string) {
  requireMongo();

  TefProfile.findOne({ userId })
    .lean()
    .then((doc) => {
      if (!doc?.level || (doc.pendingPractice as { questions?: unknown[] })?.questions?.length) return;
      if (hasInFlight(userId)) return;
      return ensurePracticeBatch(userId, doc);
    })
    .catch((err) => console.warn('[reading] prefetch failed:', err.message));
}

export async function getUserProfile(userId: string) {
  requireMongo();
  const doc = await TefProfile.findOne({ userId }).lean();
  const lastEval = doc?.lastEvaluationId
    ? await TefEvaluation.findById(doc.lastEvaluationId).lean()
    : await getLatestEvaluation(userId, READING_MODULE);
  return profileFromDoc(doc, lastEval);
}

export async function getUserEvaluations(userId: string, limit = 20, module?: TefModule) {
  requireMongo();
  return getEvaluationHistory(userId, limit, module);
}

export async function startOnboard(userId: string) {
  requireMongo();

  const { questions } = await runGenerationGraph({
    userId,
    action: 'placement',
    topic: 'TEF Canada placement assessment',
    subagentName: 'placement',
    subagentInput: { count: config.tefPlacementCount },
  });

  await TefProfile.findOneAndUpdate(
    { userId },
    {
      $set: {
        pendingPlacement: { questions, createdAt: new Date() },
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date(), accuracyHistory: [], stats: {} },
    },
    { upsert: true }
  );

  return { questions: publicQuestions(questions) };
}

export async function submitOnboard(userId: string, userAnswers: number[]) {
  requireMongo();

  const doc = await TefProfile.findOne({ userId }).lean();
  const pending = doc?.pendingPlacement as { questions?: unknown[] } | undefined;
  const questions = pending?.questions;
  if (!questions?.length) {
    throw new Error('No placement session found — start placement first');
  }

  const { evaluation } = await runEvaluationGraph({
    userId,
    kind: 'placement',
    questions,
    userAnswers,
    useEvaluator: config.useEvaluator,
  });

  const { level, confidence } = levelFromPlacement(evaluation.overallAccuracy);
  const summary = buildEnglishSummary({
    overallAccuracy: evaluation.overallAccuracy,
    level,
    weakAreas: evaluation.weakAreas,
    kind: 'placement',
  });

  const now = new Date();
  const weakAreas = evaluation.weakAreas;

  await TefProfile.findOneAndUpdate(
    { userId },
    {
      $set: {
        level,
        confidence,
        weakAreas,
        summary,
        onboardedAt: now,
        updatedAt: now,
        pendingPlacement: null,
        pendingPractice: null,
      },
    }
  );

  const evalDoc = await persistEvaluation(userId, {
    kind: 'placement',
    evaluation,
    questions,
    userAnswers,
    levelBefore: null,
    levelAfter: level,
    adjustment: null,
    confidence,
    summary,
  });

  prefetchPractice(userId);

  storeSessionMemory(userId, {
    kind: 'placement',
    level,
    overallAccuracy: evaluation.overallAccuracy,
    weakAreas,
    summary,
    skillBreakdown: evaluation.skillBreakdown,
  }).catch((err) => console.warn('[rag] indexSession:', err.message));

  return {
    ...evaluation,
    evaluationId: evalDoc._id.toString(),
    module: READING_MODULE,
    estimatedLevel: level,
    confidence,
    weakAreas,
    summary,
    profile: {
      level,
      confidence,
      weakAreas,
      summary,
      onboardedAt: now.toISOString(),
      practiceReady: false,
      lastEvaluation: {
        id: evalDoc._id.toString(),
        module: READING_MODULE,
        kind: 'placement',
        overallAccuracy: evaluation.overallAccuracy,
        levelAfter: level,
        summary,
        createdAt: now.toISOString(),
      },
    },
  };
}

export async function onRequestPractice(userId: string) {
  requireMongo();

  let doc = await TefProfile.findOne({ userId }).lean();
  if (!doc?.level) {
    throw new Error('Complete placement before starting practice');
  }

  if (!(doc.pendingPractice as { questions?: unknown[] })?.questions?.length) {
    await ensurePracticeBatch(userId, doc);
    doc = await TefProfile.findOne({ userId }).lean();
  }

  return practiceResponse(doc!);
}

export async function onSubmitAnswers(userId: string, userAnswers: number[]) {
  requireMongo();

  const doc = await TefProfile.findOne({ userId }).lean();
  if (!doc?.level) {
    throw new Error('Complete placement before submitting practice');
  }

  const pending = doc.pendingPractice as { questions?: unknown[]; topic?: string } | undefined;
  const questions = pending?.questions;
  if (!questions?.length) {
    throw new Error('No practice session found — start practice first');
  }

  const levelBefore = doc.level as string;

  const { evaluation, levelResult } = await runEvaluationGraph({
    userId,
    kind: 'practice',
    questions,
    userAnswers,
    useEvaluator: config.useEvaluator,
    currentLevel: levelBefore,
    accuracyHistory: (doc.accuracyHistory as number[]) ?? [],
  });

  const newHistory = [...((doc.accuracyHistory as number[]) ?? []), evaluation.overallAccuracy];
  const newLevel = (levelResult?.newLevel as string) ?? levelBefore;

  const summary = buildEnglishSummary({
    overallAccuracy: evaluation.overallAccuracy,
    level: newLevel,
    weakAreas: evaluation.weakAreas,
    kind: 'practice',
  });

  const now = new Date();
  await TefProfile.findOneAndUpdate(
    { userId },
    {
      $set: {
        level: newLevel,
        weakAreas: evaluation.weakAreas,
        accuracyHistory: newHistory,
        summary,
        updatedAt: now,
        pendingPractice: null,
      },
    }
  );

  const evalDoc = await persistEvaluation(userId, {
    kind: 'practice',
    evaluation,
    questions,
    userAnswers,
    levelBefore,
    levelAfter: newLevel,
    adjustment: levelResult?.adjustment ?? 'same',
    reason: levelResult?.reason ?? null,
    summary,
    topic: pending?.topic ?? null,
  });

  prefetchPractice(userId);

  storeSessionMemory(userId, {
    kind: 'practice',
    level: newLevel,
    overallAccuracy: evaluation.overallAccuracy,
    weakAreas: evaluation.weakAreas,
    summary,
    skillBreakdown: evaluation.skillBreakdown,
  }).catch((err) => console.warn('[rag] indexSession:', err.message));

  const profile = {
    level: newLevel,
    confidence: doc.confidence ?? null,
    weakAreas: evaluation.weakAreas,
    summary,
    onboardedAt: (doc.onboardedAt as Date)?.toISOString?.() ?? doc.onboardedAt ?? null,
    practiceReady: false,
    lastEvaluation: {
      id: evalDoc._id.toString(),
      module: READING_MODULE,
      kind: 'practice',
      overallAccuracy: evaluation.overallAccuracy,
      levelAfter: newLevel,
      summary,
      createdAt: now.toISOString(),
    },
  };

  return {
    ...evaluation,
    evaluationId: evalDoc._id.toString(),
    module: READING_MODULE,
    adjustment: levelResult?.adjustment,
    newLevel,
    reason: levelResult?.reason,
    summary,
    profile,
  };
}

export async function checkSessionAnswer(
  userId: string,
  kind: 'placement' | 'practice',
  questionIndex: number,
  userAnswer: number
) {
  requireMongo();

  const doc = await TefProfile.findOne({ userId }).lean();
  const pending =
    kind === 'placement'
      ? (doc?.pendingPlacement as { questions?: unknown[] } | undefined)
      : (doc?.pendingPractice as { questions?: unknown[] } | undefined);

  const questions = pending?.questions;
  if (!questions?.length) {
    throw new Error(`No ${kind} session found — start a session first`);
  }
  if (questionIndex < 0 || questionIndex >= questions.length) {
    throw new Error('Invalid question index');
  }

  const question = questions[questionIndex] as { correctIndex?: number };
  if (typeof question.correctIndex !== 'number') {
    throw new Error('Question is missing an answer key');
  }

  return {
    correct: userAnswer === question.correctIndex,
    correctIndex: question.correctIndex,
  };
}
