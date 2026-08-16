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
  buildWritingSummary,
  countWords,
  WRITING_CRITERIA,
} from '../scoring/writingScore.js';
import {
  composeFillBlankSubmission,
  scoreFillBlanks,
} from '../scoring/fillBlankScore.js';
import {
  ensureFillBlankPrompt,
} from '../normalizeFillBlankPrompt.js';
import { buildStaticWritingExample } from '../prompts/writingExampleTemplates.js';
import {
  scoreFullWritingSubmission,
  scoreSentenceSubmission,
} from '../scoring/writingOfflineEvaluate.js';
import {
  adjustWritingLevelFromXp,
  normalizeCefrLevel,
  seedWritingLevel,
  taskModeForWritingLevel,
  WRITING_XP_THRESHOLDS,
  writingXpGain,
  xpProgressForLevel,
} from '../scoring/writingXp.js';
import { CEFR_LEVELS } from '../../../content-pipeline/subagents/shared/reading.schemas.js';
import {
  inferTefWritingSection,
  resolveTefWritingSection,
} from '../../../content-pipeline/subagents/writing/tefWritingSections.js';
import { applyWordCountToEvaluation } from '../scoring/writingWordCount.js';

function requireMongo() {
  if (!isMongoReady()) {
    throw new Error('MongoDB is not available — writing requires a database connection');
  }
}

function stripPrivatePromptFields(prompt: Record<string, unknown>) {
  const {
    rubricHints,
    acceptableAnswers,
    fullParagraph,
    blankTargets,
    context,
    ...rest
  } = prompt as Record<string, unknown> & {
    blanks?: { id: string; hint?: string; acceptableAnswers?: string[] }[];
  };
  const normalized =
    rest.taskMode === 'fill_blanks' ? ensureFillBlankPrompt(rest) : rest;
  const examSection = inferTefWritingSection(normalized) ?? normalized.examSection;
  const publicBlanks = Array.isArray(normalized.blanks)
    ? normalized.blanks.map(({ id, hint }) => ({ id, hint }))
    : undefined;
  return {
    ...normalized,
    ...(publicBlanks ? { blanks: publicBlanks } : {}),
    ...(examSection ? { examSection } : {}),
  };
}

function resolveWritingLevel(doc: Record<string, unknown>) {
  const readingLevel = normalizeCefrLevel(doc.level as string | null);
  const writingLevel =
    normalizeCefrLevel(doc.writingLevel as string | null) ?? seedWritingLevel(readingLevel);
  return { readingLevel, writingLevel };
}

function isStalePendingWritingPrompt(
  storedPrompt: Record<string, unknown> | undefined,
  writingLevel: string
) {
  if (!storedPrompt) return false;

  const expectedTaskMode = taskModeForWritingLevel(writingLevel);
  const storedTaskMode = storedPrompt.taskMode ? String(storedPrompt.taskMode) : '';
  if (storedTaskMode && storedTaskMode !== expectedTaskMode) return true;

  const promptLevel = normalizeCefrLevel(storedPrompt.level as string | null);
  if (promptLevel && promptLevel !== writingLevel) return true;

  return false;
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

function shouldUseWritingTemplatesOnly() {
  return process.env.TEF_WRITING_USE_TEMPLATES === 'true';
}

function shouldUseLlmWritingExamples() {
  return process.env.TEF_WRITING_USE_LLM_EXAMPLES === 'true';
}

function composeSentenceSubmission(
  sentencePrompts: { id: string; prompt: string }[],
  answers: Record<string, string>
) {
  return sentencePrompts
    .map((row, index) => `${index + 1}. ${row.prompt}\n→ ${String(answers[row.id] ?? '').trim()}`)
    .join('\n\n');
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
    xpGain: number;
    writingXp: number;
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
    confidence: null,
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
        'stats.writingXp': data.xpGain,
      },
    }
  );

  return evalDoc;
}

async function generateAndStoreWritingPrompt(
  userId: string,
  opts: {
    writingLevel: string;
    topic?: string;
    section?: 'A' | 'B';
    lastSection?: 'A' | 'B' | null;
    weakAreas?: string[];
    previousPromptId?: string | null;
  }
) {
  const lastSection = opts.lastSection ?? null;
  const section = resolveTefWritingSection(opts.section, lastSection);
  const weakAreas = opts.weakAreas ?? [];

  const { prompt } = await runContentPipeline({
    service: PIPELINE_SERVICES.WRITING_GENERATE_PROMPT,
    userId,
    input: {
      level: opts.writingLevel,
      section,
      lastSection,
      topic: opts.topic ?? defaultTopicForSection(section),
      weakAreas,
      previousPromptId: opts.previousPromptId ?? null,
    },
  });

  const storedPrompt =
    (prompt as Record<string, unknown>).taskMode === 'fill_blanks'
      ? ensureFillBlankPrompt(prompt as Record<string, unknown>)
      : prompt;

  await TefProfile.findOneAndUpdate(
    { userId },
    {
      $set: {
        pendingWriting: { prompt: storedPrompt, createdAt: new Date() },
        updatedAt: new Date(),
      },
    }
  );

  return storedPrompt as Record<string, unknown>;
}

function prefetchWritingPrompt(
  userId: string,
  writingLevel: string,
  weakAreas: string[]
) {
  getLastWritingSection(userId)
    .then((lastSection) =>
      generateAndStoreWritingPrompt(userId, {
        writingLevel,
        weakAreas,
        lastSection,
      })
    )
    .catch((err) => console.warn('[writing] prefetch:', err.message));
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

  const { readingLevel, writingLevel } = resolveWritingLevel(doc);
  const taskMode = taskModeForWritingLevel(writingLevel);

  if (!doc.writingLevel) {
    await TefProfile.findOneAndUpdate(
      { userId },
      { $set: { writingLevel, updatedAt: new Date() } }
    );
  }

  const pending = doc.pendingWriting as { prompt?: Record<string, unknown>; createdAt?: Date } | undefined;
  const isLegacyFillBlank =
    taskMode === 'fill_blanks' &&
    pending?.prompt &&
    !pending.prompt.fullParagraph &&
    !pending.prompt.blankTargets;
  const staleForLevel = isStalePendingWritingPrompt(pending?.prompt, writingLevel);

  if (pending?.prompt && !opts.refresh && !isLegacyFillBlank && !staleForLevel) {
    let storedPrompt = pending.prompt;
    if (storedPrompt.taskMode === 'fill_blanks' || taskMode === 'fill_blanks') {
      storedPrompt = ensureFillBlankPrompt(storedPrompt);
      if (storedPrompt !== pending.prompt) {
        await TefProfile.findOneAndUpdate(
          { userId },
          {
            $set: {
              pendingWriting: { prompt: storedPrompt, createdAt: pending.createdAt ?? new Date() },
              updatedAt: new Date(),
            },
          }
        );
      }
    }
    return {
      readingLevel,
      level: writingLevel,
      writingLevel,
      taskMode: storedPrompt.taskMode ?? taskMode,
      prompt: stripPrivatePromptFields(storedPrompt),
      criteria: WRITING_CRITERIA,
      ready: true,
    };
  }

  const weakAreas = ((doc.weakAreas as string[]) ?? []).filter((t) =>
    ['expression écrite', 'vocabulaire', 'grammaire'].includes(t)
  );

  const lastSection =
    inferTefWritingSection(pending?.prompt) ?? (await getLastWritingSection(userId));

  const storedPrompt = await generateAndStoreWritingPrompt(userId, {
    writingLevel,
    section: opts.section,
    lastSection,
    topic: opts.topic,
    weakAreas,
    previousPromptId: opts.refresh ? String(pending?.prompt?.id ?? '') : null,
  });

  const publicPromptData = stripPrivatePromptFields(storedPrompt);

  return {
    readingLevel,
    level: writingLevel,
    writingLevel,
    taskMode: (publicPromptData.taskMode as string) ?? taskMode,
    prompt: publicPromptData,
    criteria: WRITING_CRITERIA,
    ready: true,
  };
}

export async function submitWriting(
  userId: string,
  body: { text?: string; blanks?: Record<string, string>; sentences?: Record<string, string> }
) {
  requireMongo();

  const doc = await TefProfile.findOne({ userId }).lean();
  if (!doc?.level) {
    throw new Error('Complete reading placement before submitting writing');
  }

  const pending = doc.pendingWriting as { prompt?: Record<string, unknown> } | undefined;
  let prompt = pending?.prompt;
  if (!prompt) {
    throw new Error('No writing prompt found — request a prompt first');
  }

  if (String(prompt.taskMode) === 'fill_blanks') {
    prompt = ensureFillBlankPrompt(prompt);
  }

  const { writingLevel } = resolveWritingLevel(doc);
  const levelBefore = writingLevel;
  const taskMode = String(prompt.taskMode ?? taskModeForWritingLevel(writingLevel));
  const stats = (doc.stats as Record<string, number>) ?? {};
  const previousWritingXp = stats.writingXp ?? 0;

  let evaluation: Record<string, unknown>;
  let submission = '';
  let wordCount = 0;

  if (taskMode === 'fill_blanks') {
    const blanks = (prompt.blanks as { id: string; acceptableAnswers?: string[] }[]) ?? [];
    const answers = body.blanks ?? {};
    const scored = scoreFillBlanks(blanks, answers);
    evaluation = scored;
    submission = composeFillBlankSubmission(
      (prompt.paragraphParts as { type: string; value?: string; id?: string }[]) ?? [],
      answers
    );
    wordCount = scored.wordCount;
  } else if (taskMode === 'sentences') {
    const sentencePrompts =
      (prompt.sentencePrompts as { id: string; prompt: string; minWords: number; maxWords: number }[]) ??
      [];
    submission = composeSentenceSubmission(sentencePrompts, body.sentences ?? {});
    wordCount = countWords(submission);

    try {
      const llmEvaluation = await runContentPipeline({
        service: PIPELINE_SERVICES.WRITING_EVALUATE,
        userId,
        input: {
          prompt: {
            ...prompt,
            taskMode: 'sentences',
            minWords: 4,
            maxWords: 18,
          },
          submission,
          wordCount,
          level: writingLevel,
        },
      });
      evaluation = llmEvaluation as Record<string, unknown>;
    } catch (err) {
      console.warn(
        `[writing] sentence evaluation LLM failed (${err instanceof Error ? err.message : err}) — using offline scoring`
      );
      evaluation = scoreSentenceSubmission(sentencePrompts, body.sentences ?? {});
    }
  } else {
    submission = String(body.text ?? '').trim();
    if (!submission) throw new Error('Write your answer before submitting');
    wordCount = countWords(submission);

    try {
      const llmEvaluation = await runContentPipeline({
        service: PIPELINE_SERVICES.WRITING_EVALUATE,
        userId,
        input: {
          prompt,
          submission,
          wordCount,
          level: writingLevel,
        },
      });
      evaluation = applyWordCountToEvaluation(
        llmEvaluation,
        wordCount,
        prompt,
        writingLevel
      ) as Record<string, unknown>;
    } catch (err) {
      console.warn(
        `[writing] full evaluation LLM failed (${err instanceof Error ? err.message : err}) — using offline scoring`
      );
      evaluation = scoreFullWritingSubmission(submission, wordCount, prompt, writingLevel);
    }
  }

  const criteria = evaluation.criteria as Record<string, unknown>[];
  const overallScore = overallWritingScore(criteria);
  const overallAccuracy = aggregateWritingScore(criteria);
  const weakAreas = weakAreasFromCriteria(criteria);

  const xpGain = writingXpGain(overallScore, taskMode);
  const levelResult = adjustWritingLevelFromXp(levelBefore, previousWritingXp, xpGain);
  const newLevel = levelResult.newLevel ?? levelBefore;
  const newWritingXp = levelResult.newXp;

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
        writingLevel: newLevel,
        summary,
        updatedAt: now,
        pendingWriting: null,
        writingScoreHistory: [...((doc.writingScoreHistory as number[]) ?? []), overallScore].slice(-20),
      },
    }
  );

  const evalDoc = await persistWritingEvaluation(userId, {
    prompt,
    submission,
    wordCount,
    criteria,
    overallScore,
    overallAccuracy,
    weakAreas,
    levelBefore,
    levelAfter: newLevel,
    adjustment: levelResult.adjustment,
    reason: levelResult.reason,
    xpGain,
    writingXp: newWritingXp,
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

  prefetchWritingPrompt(userId, newLevel, weakAreas);

  const progress = xpProgressForLevel(newWritingXp, newLevel);

  return {
    module: WRITING_MODULE,
    evaluationId: evalDoc._id.toString(),
    overallScore,
    overallAccuracy,
    criteria,
    weakAreas,
    suggestions: evaluation.suggestions,
    summary: evaluation.summary ?? summary,
    adjustment: levelResult.adjustment,
    newLevel,
    reason: levelResult.reason,
    wordCount,
    xpGain,
    writingXp: newWritingXp,
    writingProgress: progress,
    taskMode,
    profile: {
      readingLevel: doc.level,
      level: newLevel,
      writingLevel: newLevel,
      writingXp: newWritingXp,
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
  const pending = doc.pendingWriting as { prompt?: Record<string, unknown> } | undefined;
  const prompt = pending?.prompt;
  if (!prompt) {
    throw new Error('No active writing prompt — request a prompt first');
  }

  const staticExample = buildStaticWritingExample(prompt);

  if (shouldUseWritingTemplatesOnly() || !shouldUseLlmWritingExamples()) {
    return {
      promptId: prompt.id,
      ...staticExample,
    };
  }

  try {
    const { writingLevel } = resolveWritingLevel(doc ?? {});
    const result = await runContentPipeline({
      service: PIPELINE_SERVICES.WRITING_EXAMPLE_ANSWER,
      userId,
      input: {
        prompt,
        level: writingLevel,
      },
    });

    return {
      promptId: prompt.id,
      exampleAnswer: result.exampleAnswer,
      wordCount: result.wordCount,
      notes: result.notes ?? null,
    };
  } catch (err) {
    console.warn(
      `[writing] example LLM failed (${err instanceof Error ? err.message : err}) — using template fallback`
    );
    return {
      promptId: prompt.id,
      ...staticExample,
    };
  }
}

export async function getWritingEvaluations(userId: string, limit = 20) {
  requireMongo();
  return getEvaluationHistory(userId, limit, WRITING_MODULE);
}

export async function getWritingProfile(userId: string) {
  requireMongo();
  const doc = await TefProfile.findOne({ userId }).lean();
  if (!doc?.level) return null;

  const { readingLevel, writingLevel } = resolveWritingLevel(doc);
  const stats = (doc.stats as Record<string, number>) ?? {};
  const writingXp = stats.writingXp ?? 0;
  const pending = doc.pendingWriting as { prompt?: Record<string, unknown> } | undefined;
  const lastEval = doc.lastEvaluationId
    ? await TefEvaluation.findById(doc.lastEvaluationId).lean()
    : null;

  return {
    readingLevel,
    level: writingLevel,
    writingLevel,
    writingXp,
    writingProgress: xpProgressForLevel(writingXp, writingLevel),
    taskMode: taskModeForWritingLevel(writingLevel),
    writingReady: Boolean(pending?.prompt),
    pendingPrompt: pending?.prompt ? stripPrivatePromptFields(pending.prompt) : null,
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

export async function setWritingLevelManually(userId: string, level: string) {
  requireMongo();

  const normalized = normalizeCefrLevel(level);
  if (!normalized || !CEFR_LEVELS.includes(normalized)) {
    throw new Error('Invalid CEFR level');
  }

  const doc = await TefProfile.findOne({ userId }).lean();
  if (!doc?.level) {
    throw new Error('Complete reading placement before setting a writing level');
  }

  const writingXp = WRITING_XP_THRESHOLDS[normalized] ?? 0;
  const weakAreas = (doc.weakAreas as string[]) ?? [];

  await TefProfile.findOneAndUpdate(
    { userId },
    {
      $set: {
        writingLevel: normalized,
        'stats.writingXp': writingXp,
        pendingWriting: null,
        updatedAt: new Date(),
      },
    }
  );

  prefetchWritingPrompt(userId, normalized, weakAreas);

  return {
    writingLevel: normalized,
    level: normalized,
    writingXp,
    writingProgress: xpProgressForLevel(writingXp, normalized),
    taskMode: taskModeForWritingLevel(normalized),
  };
}
