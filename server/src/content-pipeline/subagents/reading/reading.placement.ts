// @ts-nocheck
import { callStructuredSubagent } from '../shared/client.js';
import { placementBatchSchema } from '../shared/reading.schemas.js';
import { normalizePlacementBatch, SKILL_TAGS } from '../shared/reading.normalize.js';

const SKILL_LIST = SKILL_TAGS.map((t) => `"${t}"`).join(' | ');

const PLACEMENT_SYSTEM = `Generate a TEF Canada placement quiz as one JSON batch.

Rules:
- exactly 6 MCQs in one response (or count requested).
- question + options: French only, formal/administrative style.
- include correctIndex (0-3) and skillTag per question.
- exactly 4 options each.
- skillTag must be one of: ${SKILL_LIST}
- If contextBlock is provided, avoid repeating past topics and target weak skills.

Output only: {"questions":[{"id":"q1","question":"...","options":["..","..","..",".."],"correctIndex":0,"skillTag":"compréhension écrite"}]}`;

export default {
  name: 'placement',
  description: 'Generate a full placement batch (MCQs with answers). Input: { count?: number }',
  async run(input) {
    const payload = typeof input === 'string' ? JSON.parse(input) : input ?? {};
    const count = Math.min(Math.max(Number(payload.count) || 5, 5), 6);

    return callStructuredSubagent({
      systemPrompt: PLACEMENT_SYSTEM,
      userPayload: {
        count,
        contextBlock: payload.contextBlock ?? '',
      },
      schema: placementBatchSchema,
      normalize: normalizePlacementBatch,
      guardrailsKind: 'placement',
    });
  },
};
