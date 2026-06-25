// @ts-nocheck
import { TefProfile, TefEvaluation, isMongoReady } from '../../../app/db/mongo.js';
import {
  PIPELINE_SERVICES,
  runContentPipeline,
} from '../../../content-pipeline/pipeline.js';
import { storeSessionMemory } from '../../../content-pipeline/memory/rag.js';
import { getEvaluationHistory } from '../../../app/services/userService.js';
import { WRITING_MODULE, WRITING_EVALUATION_KIND } from '../schemas/writing.mongo.js';
import {
  aggregateWritingScore,
  overallWritingScore,
  criteriaToSkillBreakdown,
  weakAreasFromCriteria,
  levelFromWritingScore,
  adjustWritingLevel,
  buildWritingSummary,
  countWords,
  WRITING_CRITERIA,
} from '../scoring/writingScore.js';
import {
  inferTefWritingSection,
  resolveTefWritingSection,
} from '../../../content-pipeline/subagents/writing/tefWritingSections.js';

function requireMongo() {
  if (!isMongoReady()) {
    throw new Error('MongoDB is not available — writing requires a database connection');
  }
}

function publicPrompt(prompt: Record<string, unknown>) {
  const { rubricHints, ...rest } = prompt;
  const examSection = inferTefWritingSection(rest) ?? rest.examSection;
  return examSection ? { ...rest, examSection } : rest;
}

async function getLastWritingSection(userId: string) {
  const lastEval = await TefEvaluation.findOne({ userId, module: WRITING_MODULE })
    .sort({ createdAt: -1 })
    .lean();
  const storedPrompt = lastEval?.questions?.[0] as Record<string, unknown> | undefined;
  return inferTefWritingSection(storedPrompt);
}

function defaultTopicForSection(section: 'A' | 'B') {
  return section === 'A'
    ? 'daily life situation, short narrative, or brief message'
    : 'social or professional topic requiring a structured opinion';
}

async function persistWritingEvaluation(
  userId: string,
  data: {
    prompt: Record<string, unknown>;
    submission: string;
    wordCount: number;
    criteria: Record<string, unknown>[];
    overallScore: number;
    overallAccuracy: number;
    weakAreas: string[];
    levelBefore: string;
    levelAfter: string;
    adjustment: string;
    reason: string;
    confidence: number;
    summary: string;
    suggestions: string[];
  }
) {
  const evalDoc = await TefEvaluation.create({
    userId,
    module: WRITING_MODULE,
    kind: WRITING_EVALUATION_KIND,
    overallAccuracy: data.overallAccuracy,
    skillBreakdown: criteriaToSkillBreakdown(data.criteria),
    criteriaBreakdown: data.criteria,
    weakAreas: data.weakAreas,
    userAnswers: [],
    userSubmission: {
      text: data.submission,
      wordCount: data.wordCount,
    },
    results: [],
    questions: [data.prompt],
    levelBefore: data.levelBefore,
    levelAfter: data.levelAfter,
    adjustment: data.adjustment,
    reason: data.reason,
    confidence: data.confidence,
    summary: data.summary,
    topic: data.prompt.topic ?? null,
  });

  await TefProfile.findOneAndUpdate(
    { userId },
    {
      $set: { lastEvaluationId: evalDoc._id, updatedAt: new Date() },
      $inc: {
        'stats.totalSessions': 1,
        'stats.totalQuestions': 1,
        'stats.xp': data.overallScore + 10,
      },
    }
  );

  return evalDoc;
}

export async function getWritingPrompt(
  userId: string,
  opts: { topic?: string; section?: 'A' | 'B'; refresh?: boolean } = {}
) {
  requireMongo();

  const doc = await TefProfile.findOne({ userId }).lean();
  if (!doc?.level) {
    throw new Error('Complete reading placement before starting writing practice');
  }

  const pending = doc.pendingWriting as { prompt?: Record<string, unknown> } | undefined;
  if (pending?.prompt && !opts.refresh) {
    return {
      level: doc.level,
      prompt: publicPrompt(pending.prompt),
      criteria: WRITING_CRITERIA,
      ready: true,
    };
  }

  const weakAreas = ((doc.weakAreas as string[]) ?? []).filter((t) =>
    ['expression écrite', 'vocabulaire', 'grammaire'].includes(t)
  );

  const lastSection =
    inferTefWritingSection(pending?.prompt) ?? (await getLastWritingSection(userId));
  const section = resolveTefWritingSection(opts.section, lastSection);

  const { prompt } = await runContentPipeline({
    service: PIPELINE_SERVICES.WRITING_GENERATE_PROMPT,
    userId,
    input: {
      level: doc.level,
      section,
      lastSection,
      topic: opts.topic ?? defaultTopicForSection(section),
      weakAreas,
    },
  });

  const pendingWriting = { prompt, createdAt: new Date() };
  await TefProfile.findOneAndUpdate(
    { userId },
    { $set: { pendingWriting, updatedAt: new Date() } }
  );

  return {
    level: doc.level,
    prompt: publicPrompt(prompt as Record<string, unknown>),
    criteria: WRITING_CRITERIA,
    ready: true,
  };
}

export async function submitWriting(userId: string, text: string) {
  requireMongo();

  const doc = await TefProfile.findOne({ userId }).lean();
  if (!doc?.level) {
    throw new Error('Complete reading placement before submitting writing');
  }

  const pending = doc.pendingWriting as { prompt?: Record<string, unknown> } | undefined;
  const prompt = pending?.prompt;
  if (!prompt) {
    throw new Error('No writing prompt found — request a prompt first');
  }

  const wordCount = countWords(text);
  const levelBefore = doc.level as string;

  const evaluation = await runContentPipeline({
    service: PIPELINE_SERVICES.WRITING_EVALUATE,
    userId,
    input: {
      prompt,
      submission: text,
      wordCount,
      level: levelBefore,
    },
  });

  const criteria = evaluation.criteria as Record<string, unknown>[];
  const overallScore = overallWritingScore(criteria);
  const overallAccuracy = aggregateWritingScore(criteria);
  const weakAreas = weakAreasFromCriteria(criteria);
  const { level: estimatedLevel, confidence } = levelFromWritingScore(overallScore);

  const scoreHistory = (doc.writingScoreHistory as number[]) ?? [];
  const levelResult = adjustWritingLevel(levelBefore, scoreHistory, overallScore);
  const newLevel = levelResult.newLevel ?? levelBefore;

  const summary = buildWritingSummary({
    overallScore,
    level: newLevel,
    weakAreas,
  });

  const now = new Date();
  await TefProfile.findOneAndUpdate(
    { userId },
    {
      $set: {
        level: newLevel,
        summary,
        updatedAt: now,
        pendingWriting: null,
        writingScoreHistory: [...scoreHistory, overallScore].slice(-20),
      },
    }
  );

  const evalDoc = await persistWritingEvaluation(userId, {
    prompt,
    submission: text,
    wordCount,
    criteria,
    overallScore,
    overallAccuracy,
    weakAreas,
    levelBefore,
    levelAfter: newLevel,
    adjustment: levelResult.adjustment,
    reason: levelResult.reason,
    confidence,
    summary,
    suggestions: (evaluation.suggestions as string[]) ?? [],
  });

  storeSessionMemory(userId, {
    kind: 'writing',
    level: newLevel,
    overallAccuracy,
    weakAreas,
    summary,
    skillBreakdown: criteriaToSkillBreakdown(criteria),
  }).catch((err) => console.warn('[rag] writing index:', err.message));

  return {
    module: WRITING_MODULE,
    evaluationId: evalDoc._id.toString(),
    overallScore,
    overallAccuracy,
    criteria,
    weakAreas,
    suggestions: evaluation.suggestions,
    summary: evaluation.summary,
    adjustment: levelResult.adjustment,
    newLevel,
    reason: levelResult.reason,
    wordCount,
    profile: {
      level: newLevel,
      confidence,
      weakAreas,
      summary,
      lastEvaluation: {
        id: evalDoc._id.toString(),
        module: WRITING_MODULE,
        kind: WRITING_EVALUATION_KIND,
        overallAccuracy,
        levelAfter: newLevel,
        summary,
        createdAt: now.toISOString(),
      },
    },
  };
}

export async function getWritingExample(userId: string) {
  requireMongo();

  const doc = await TefProfile.findOne({ userId }).lean();
  const pending = doc?.pendingWriting as { prompt?: Record<string, unknown> } | undefined;
  const prompt = pending?.prompt;

  if (!prompt) {
    throw new Error('No active writing prompt — request a prompt first');
  }

  const result = await runContentPipeline({
    service: PIPELINE_SERVICES.WRITING_EXAMPLE_ANSWER,
    userId,
    input: {
      prompt,
      level: doc?.level ?? prompt.level,
    },
  });

  return {
    promptId: prompt.id,
    exampleAnswer: result.exampleAnswer,
    wordCount: result.wordCount,
    notes: result.notes ?? null,
  };
}

export async function getWritingEvaluations(userId: string, limit = 20) {
  requireMongo();
  return getEvaluationHistory(userId, limit, WRITING_MODULE);
}

export async function getWritingProfile(userId: string) {
  requireMongo();
  const doc = await TefProfile.findOne({ userId }).lean();
  if (!doc?.level) return null;

  const pending = doc.pendingWriting as { prompt?: Record<string, unknown> } | undefined;
  const lastEval = doc.lastEvaluationId
    ? await TefEvaluation.findById(doc.lastEvaluationId).lean()
    : null;

  return {
    level: doc.level,
    writingReady: Boolean(pending?.prompt),
    pendingPrompt: pending?.prompt ? publicPrompt(pending.prompt) : null,
    writingScoreHistory: doc.writingScoreHistory ?? [],
    criteria: WRITING_CRITERIA,
    lastEvaluation:
      lastEval?.module === WRITING_MODULE
        ? {
            id: String(lastEval._id),
            module: lastEval.module,
            overallScore: Math.round((lastEval.overallAccuracy ?? 0) * 100),
            criteriaBreakdown: lastEval.criteriaBreakdown,
            summary: lastEval.summary,
            createdAt: lastEval.createdAt,
          }
        : null,
  };
}
