// @ts-nocheck
import { callStructuredSubagent } from '../shared/client.js';
import { getTefModel } from '../../core/llm.js';
import { applyWordCountToEvaluation } from '../../../services/writing/scoring/writingWordCount.js';
import {
  normalizeWritingEvaluationOutput,
  writingEvaluationOutputSchema,
} from './writing.schemas.js';

const EVAL_SYSTEM = `Evaluate a French writing submission for TEF Canada expression écrite.

Return JSON with exactly these fields:
- criteria: array of 4 objects, each with:
  - criterion: one of "content_coherence" | "vocabulary" | "language_accuracy" | "task_fulfillment"
  - label: short English label
  - score: integer 0–100
  - feedback: 1–2 English sentences
- overallScore: integer 0–100 (weighted: task_fulfillment and language_accuracy matter slightly more)
- summary: 2–3 English sentences
- suggestions: array of 3–5 English strings

Scoring rules:
1. Use prompt.minWords and prompt.maxWords as the ONLY word-count requirements for this task.
   Section A targets ~80–120 words; Section B targets ~200–280 words when set on the prompt.
   Do NOT compare length to CEFR-level word bands or level-based length expectations.
2. Do NOT penalize vocabulary, language_accuracy, or content_coherence for word count.
3. Score task_fulfillment for instructions, tone, register, and task type only — NOT for word count.
   Word-count compliance is scored separately by the system after your response.
4. Use prompt.examSection (A or B) and prompt.level for qualitative expectations:
   - Section A: shorter narrative/message tasks; Section B: longer argumentative/discursive tasks.
   - CEFR level guides vocabulary sophistication, grammatical complexity, coherence, and register.

Be fair but rigorous like an official TEF examiner. Output only JSON.`;

export default {
  name: 'writingEvaluator',
  description: 'Evaluate a writing submission on TCF criteria',
  async run(input) {
    const payload = typeof input === 'string' ? JSON.parse(input) : input ?? {};

    const llmEvaluation = await callStructuredSubagent({
      systemPrompt: EVAL_SYSTEM,
      userPayload: {
        prompt: payload.prompt,
        submission: payload.submission,
        wordCount: payload.wordCount,
        level: payload.level,
        wordCountRequirements: {
          minWords: payload.prompt?.minWords,
          maxWords: payload.prompt?.maxWords,
        },
      },
      schema: writingEvaluationOutputSchema,
      normalize: normalizeWritingEvaluationOutput,
      maxAttempts: 3,
      models: [getTefModel()],
    });

    return applyWordCountToEvaluation(
      llmEvaluation,
      payload.wordCount,
      payload.prompt,
      payload.level
    );
  },
};
