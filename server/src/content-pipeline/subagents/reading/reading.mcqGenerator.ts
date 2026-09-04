// @ts-nocheck
import { callStructuredSubagent } from '../shared/client.js';
import { mcqBatchOutputSchema } from '../shared/reading.schemas.js';
import { normalizeMcqBatch, SKILL_TAGS } from '../shared/reading.normalize.js';
import {
  readingLevelGuidance,
  TEF_READING_SECTIONS,
  getTefPracticeQuestionCount,
  sectionQuestionCount,
} from '../../../services/reading/prompts/readingExamStructure.js';

const SKILL_LIST = SKILL_TAGS.map((t) => `"${t}"`).join(' | ');
const SECTION_LIST = TEF_READING_SECTIONS.map(
  (s) => `${s.code}. ${s.titleFr} (${sectionQuestionCount(s)} Q)`
).join('\n');

const MCQ_SYSTEM = `Generate a TEF Canada compréhension écrite practice batch as JSON.

Official exam: 40 MCQs in 60 minutes. This practice batch mirrors the 7 TEF sub-sections:
${SECTION_LIST}

Rules:
- Total questions: ${getTefPracticeQuestionCount()} (distributed across sections as above).
- question + options: French only, formal/administrative register for Canada.
- exactly 4 options, include correctIndex (0-3) and skillTag.
- skillTag must be one of: ${SKILL_LIST}
- Tailor vocabulary, passage length, and inference depth to the learner CEFR level guidance provided.
- Include passage text for document-based sections when needed.
- brief explanation in English (optional).

Output: {"questions":[{"question":"...","options":["..","..","..",".."],"correctIndex":0,"skillTag":"compréhension écrite","explanation":"..."}]}`;

export default {
  name: 'mcqGenerator',
  description:
    'Generate TEF-style MCQ batch with answers. Input: { level, weakAreas, topic, count?: number }',
  async run(input) {
    const payload = typeof input === 'string' ? JSON.parse(input) : input ?? {};

    const { level, weakAreas, topic, count = getTefPracticeQuestionCount() } = payload;

    if (!level || !topic) {
      throw new Error('Requires level and topic');
    }

    const batchSize = Math.min(Math.max(Number(count) || getTefPracticeQuestionCount(), 7), 20);

    return callStructuredSubagent({
      systemPrompt: MCQ_SYSTEM,
      userPayload: {
        level,
        levelGuidance: readingLevelGuidance(level),
        weakAreas: weakAreas ?? [],
        topic,
        count: batchSize,
        tefSections: TEF_READING_SECTIONS,
        contextBlock: payload.contextBlock ?? '',
      },
      schema: mcqBatchOutputSchema,
      normalize: normalizeMcqBatch,
      guardrailsKind: 'practice',
    });
  },
};
