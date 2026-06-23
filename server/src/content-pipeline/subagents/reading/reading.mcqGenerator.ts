// @ts-nocheck
import { callStructuredSubagent } from '../shared/client.js';
import { mcqBatchOutputSchema } from '../shared/reading.schemas.js';
import { normalizeMcqBatch, SKILL_TAGS } from '../shared/reading.normalize.js';

const SKILL_LIST = SKILL_TAGS.map((t) => `"${t}"`).join(' | ');

const MCQ_SYSTEM = `Generate TEF Canada MCQ batch as JSON. Rules:
- question + options: French only, formal register.
- exactly 4 options, include correctIndex (0-3) and skillTag.
- skillTag must be one of: ${SKILL_LIST}
- If contextBlock is provided, use learner history and research snippets to tailor questions.
- brief explanation in English (optional).

Output: {"questions":[{"question":"...","options":["..","..","..",".."],"correctIndex":0,"skillTag":"grammaire","explanation":"..."}]}`;

export default {
  name: 'mcqGenerator',
  description:
    'Generate TEF-style MCQ batch with answers. Input: { level, weakAreas, topic, count?: number }',
  async run(input) {
    const payload = typeof input === 'string' ? JSON.parse(input) : input ?? {};

    const { level, weakAreas, topic, count = 3 } = payload;

    if (!level || !topic) {
      throw new Error('Requires level and topic');
    }

    const batchSize = Math.min(Math.max(Number(count) || 3, 1), 5);

    return callStructuredSubagent({
      systemPrompt: MCQ_SYSTEM,
      userPayload: {
        level,
        weakAreas: weakAreas ?? [],
        topic,
        count: batchSize,
        contextBlock: payload.contextBlock ?? '',
      },
      schema: mcqBatchOutputSchema,
      normalize: normalizeMcqBatch,
      guardrailsKind: 'practice',
    });
  },
};
