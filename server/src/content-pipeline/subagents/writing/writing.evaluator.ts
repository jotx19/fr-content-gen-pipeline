// @ts-nocheck
import { callStructuredSubagent } from '../shared/client.js';
import { getTefModel } from '../../core/llm.js';
import {
  normalizeWritingEvaluationOutput,
  writingEvaluationOutputSchema,
} from './writing.schemas.js';

const EVAL_SYSTEM = `Evaluate a French writing submission for TCF / TEF expression écrite.

Return JSON with exactly these fields:
- criteria: array of 4 objects, each with:
  - criterion: one of "content_coherence" | "vocabulary" | "language_accuracy" | "task_fulfillment"
  - label: short English label
  - score: integer 0–100
  - feedback: 1–2 English sentences
- overallScore: integer 0–100 (weighted: task_fulfillment and language_accuracy matter slightly more)
- summary: 2–3 English sentences
- suggestions: array of 3–5 English strings

Be fair but rigorous like an official examiner. Output only JSON.`;

export default {
  name: 'writingEvaluator',
  description: 'Evaluate a writing submission on TCF criteria',
  async run(input) {
    const payload = typeof input === 'string' ? JSON.parse(input) : input ?? {};

    return callStructuredSubagent({
      systemPrompt: EVAL_SYSTEM,
      userPayload: {
        prompt: payload.prompt,
        submission: payload.submission,
        wordCount: payload.wordCount,
        level: payload.level,
      },
      schema: writingEvaluationOutputSchema,
      normalize: normalizeWritingEvaluationOutput,
      maxAttempts: 3,
      // Single fast model — avoid openrouter/free fallback (often 90s+).
      models: [getTefModel()],
    });
  },
};
