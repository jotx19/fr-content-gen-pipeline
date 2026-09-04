// @ts-nocheck
import { callStructuredSubagent } from '../shared/client.js';
import { config } from '../../../config.js';
import { scoreSentenceSubmission } from '../../../services/writing/scoring/writingOfflineEvaluate.js';
import { evaluateWritingWithRubric } from '../../../services/writing/scoring/writingRubricEvaluate.js';
import {
  normalizeWritingEvaluationOutput,
  writingEvaluationOutputSchema,
} from './writing.schemas.js';

const COMPACT_LLM_SYSTEM = `You are a TEF Canada writing examiner. Rubric pre-scores are provided — adjust them based on the French submission quality.

Rules:
- Change each criterion score by at most ±12 from the rubric value.
- Focus on grammar (language_accuracy) and vocabulary sophistication.
- Do NOT score word count — the system handles that.
- Return JSON: criteria (4 items), overallScore (weighted), summary (2 sentences), suggestions (3 strings).
- Be fair and vary scores when text quality clearly differs.`;

function mergeRubricWithLlm(
  rubric: Record<string, unknown>,
  llm: Record<string, unknown>
) {
  const rubricCriteria = (rubric.criteria as { criterion: string; score: number; feedback: string }[]) ?? [];
  const llmCriteria = (llm.criteria as { criterion: string; score: number; feedback: string }[]) ?? [];

  const criteria = rubricCriteria.map((row) => {
    const llmRow = llmCriteria.find((c) => c.criterion === row.criterion);
    if (!llmRow) return row;
    const blended = Math.round(row.score * 0.55 + llmRow.score * 0.45);
    const clamped = Math.max(row.score - 12, Math.min(row.score + 12, blended));
    return {
      ...row,
      score: clamped,
      feedback: llmRow.feedback || row.feedback,
    };
  });

  const weighted =
    (criteria.find((c) => c.criterion === 'content_coherence')?.score ?? 0) * 0.2 +
    (criteria.find((c) => c.criterion === 'vocabulary')?.score ?? 0) * 0.2 +
    (criteria.find((c) => c.criterion === 'language_accuracy')?.score ?? 0) * 0.3 +
    (criteria.find((c) => c.criterion === 'task_fulfillment')?.score ?? 0) * 0.3;

  return {
    ...rubric,
    criteria,
    overallScore: Math.round(weighted),
    summary: String(llm.summary ?? rubric.summary),
    suggestions: (llm.suggestions as string[]) ?? rubric.suggestions,
    evaluationMethod: 'llm_polish',
  };
}

async function tryLlmPolish(
  payload: Record<string, unknown>,
  rubric: Record<string, unknown>
) {
  if (process.env.TEF_WRITING_USE_LLM_EVAL === 'false') return null;
  if (!process.env.OPENROUTER_API_KEY) return null;

  try {
    const llm = await callStructuredSubagent({
      systemPrompt: COMPACT_LLM_SYSTEM,
      userPayload: {
        level: payload.level,
        prompt: {
          title: (payload.prompt as Record<string, unknown>)?.title,
          instructions: (payload.prompt as Record<string, unknown>)?.instructions,
          taskType: (payload.prompt as Record<string, unknown>)?.taskType,
          examSection: (payload.prompt as Record<string, unknown>)?.examSection,
        },
        submissionExcerpt: String(payload.submission ?? '').slice(0, 1400),
        wordCount: payload.wordCount,
        rubricScores: (rubric.criteria as { criterion: string; score: number }[]).map((c) => ({
          criterion: c.criterion,
          score: c.score,
        })),
      },
      schema: writingEvaluationOutputSchema,
      normalize: normalizeWritingEvaluationOutput,
      maxAttempts: 3,
      models: ['openrouter/free'],
      maxTokens: 384,
    });

    return mergeRubricWithLlm(rubric, llm as Record<string, unknown>);
  } catch (err) {
    console.warn(
      `[writing] LLM polish skipped (${err instanceof Error ? err.message : err}) — rubric only`
    );
    return null;
  }
}

export default {
  name: 'writingEvaluator',
  description: 'Evaluate writing with template rubric (+ optional LLM polish)',
  async run(input) {
    const payload = typeof input === 'string' ? JSON.parse(input) : input ?? {};
    const taskMode = String((payload.prompt as Record<string, unknown>)?.taskMode ?? 'full');

    if (taskMode === 'sentences') {
      const sentencePrompts =
        ((payload.prompt as Record<string, unknown>)?.sentencePrompts as {
          id: string;
          prompt: string;
          minWords: number;
          maxWords: number;
        }[]) ?? [];
      const answers = (payload.answers as Record<string, string>) ?? {};
      if (sentencePrompts.length && Object.keys(answers).length) {
        return { ...scoreSentenceSubmission(sentencePrompts, answers), evaluationMethod: 'rubric' };
      }
    }

    const rubric = evaluateWritingWithRubric(
      String(payload.submission ?? ''),
      Number(payload.wordCount ?? 0),
      (payload.prompt as Record<string, unknown>) ?? {},
      String(payload.level ?? 'B1')
    );

    const polished = await tryLlmPolish(payload, rubric as Record<string, unknown>);
    return polished ?? rubric;
  },
};
