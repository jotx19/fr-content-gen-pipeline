// @ts-nocheck
import { callStructuredSubagent } from '../shared/client.js';
import { writingPromptOutputSchema, wordCountBandForLevel } from './writing.schemas.js';

const PROMPT_SYSTEM = `Generate one TCF Canada / TEF expression écrite writing task as JSON.

Rules:
- Match the requested CEFR level (A1–C2) in vocabulary and grammatical complexity expectations.
- Use French for title, instructions, and prompt text.
- Task must feel like an official TCF/TEF written production exercise (formal letter, email, essay, or short message as appropriate for level).
- register is usually "formel" for B1+ and administrative topics.
- Set minWords and maxWords to the exact word-count requirement for THIS exam task (these become authoritative during evaluation).
- The suggested minWords/maxWords in the user payload are CEFR-level defaults for generation only — override them when the task needs different limits.
- topic: short English slug for analytics (e.g. "workplace complaint", "housing request").
- rubricHints: 2–4 brief English hints for the evaluator (do not mention CEFR word bands for scoring).

Output only:
{"prompt":{"id":"w1","title":"...","instructions":"...","prompt":"...","taskType":"letter","register":"formel","level":"B1","topic":"...","minWords":120,"maxWords":180,"rubricHints":["..."]}}`;

export default {
  name: 'writingPrompt',
  description: 'Generate a TCF-aligned writing prompt for a CEFR level',
  async run(input) {
    const payload = typeof input === 'string' ? JSON.parse(input) : input ?? {};
    const level = String(payload.level || 'B1');
    const { min, max } = wordCountBandForLevel(level);
    const topic = payload.topic ?? 'daily life in France';

    const data = await callStructuredSubagent({
      systemPrompt: PROMPT_SYSTEM,
      userPayload: {
        level,
        topic,
        minWords: min,
        maxWords: max,
        weakAreas: payload.weakAreas ?? [],
        contextBlock: payload.contextBlock ?? '',
      },
      schema: writingPromptOutputSchema,
      maxAttempts: 2,
    });

    return {
      prompt: {
        ...data.prompt,
        level,
        minWords: data.prompt.minWords ?? min,
        maxWords: data.prompt.maxWords ?? max,
      },
    };
  },
};
