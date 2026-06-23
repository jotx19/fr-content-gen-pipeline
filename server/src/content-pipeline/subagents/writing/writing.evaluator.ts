// @ts-nocheck
import { callStructuredSubagent } from '../shared/client.js';
import { getTefModelCandidates } from '../../core/llm.js';
import { writingEvaluationOutputSchema } from './writing.schemas.js';

const EVAL_SYSTEM = `Evaluate a French writing submission for TCF / TEF expression écrite.

Score each criterion from 0 to 100:
1. content_coherence — Content/Coherence: clarity, logical flow, relevance
2. vocabulary — Vocabulary: range, precision, appropriateness
3. language_accuracy — Language Accuracy: grammar, spelling, punctuation
4. task_fulfillment — Task Fulfillment: instructions, tone, word count

Be fair but rigorous like an official examiner. Feedback per criterion: 1–2 sentences in English.

Also provide:
- overallScore: weighted average (task_fulfillment and language_accuracy slightly more important)
- summary: 2–3 sentences in English
- suggestions: 3–5 actionable improvements in English

Output only JSON matching the schema.`;

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
      maxAttempts: 2,
      // Prefer configured model only — full fallback chain can exceed proxy timeouts.
      models: getTefModelCandidates().slice(0, 2),
    });
  },
};
