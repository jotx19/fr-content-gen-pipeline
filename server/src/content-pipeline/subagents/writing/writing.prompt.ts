// @ts-nocheck
import { callStructuredSubagent } from '../shared/client.js';
import { writingPromptOutputSchema } from './writing.schemas.js';
import {
  applySectionWordLimits,
  isTefWritingSection,
  resolveTefWritingSection,
  tefWritingSectionConfig,
} from './tefWritingSections.js';

function buildPromptSystem(sectionKey) {
  const section = tefWritingSectionConfig(sectionKey);
  return `Generate one TEF Canada expression écrite writing task as JSON for **Section ${sectionKey}**.

Section ${sectionKey} rules:
- ${section.description}
- Allowed taskType values: ${section.taskTypes.join(', ')}
- Allowed register values: ${section.registers.join(', ')}
- Set minWords=${section.minWords} and maxWords=${section.maxWords} exactly (official TEF Section ${sectionKey} length).
- ${section.promptGuidance.join('\n- ')}

General rules:
- Match the requested CEFR level (A1–C2) in vocabulary and grammatical complexity expectations.
- Use French for title, instructions, and prompt text.
- examSection must be "${sectionKey}".
- topic: short English slug for analytics (e.g. "workplace complaint", "housing request").
- rubricHints: 2–4 brief English hints for the evaluator (do not mention CEFR word bands for scoring).

Output only:
{"prompt":{"id":"w1","title":"...","instructions":"...","prompt":"...","examSection":"${sectionKey}","taskType":"${section.taskTypes[0]}","register":"${section.registers[0]}","level":"B1","topic":"...","minWords":${section.minWords},"maxWords":${section.maxWords},"rubricHints":["..."]}}`;
}

export default {
  name: 'writingPrompt',
  description: 'Generate a TEF Canada Section A or B writing prompt for a CEFR level',
  async run(input) {
    const payload = typeof input === 'string' ? JSON.parse(input) : input ?? {};
    const level = String(payload.level || 'B1');
    const section = resolveTefWritingSection(
      payload.section,
      isTefWritingSection(payload.lastSection) ? payload.lastSection : null
    );
    const config = tefWritingSectionConfig(section);
    const topic =
      payload.topic ??
      (section === 'A'
        ? 'daily life situation or short narrative'
        : 'social or professional topic requiring an opinion');

    const data = await callStructuredSubagent({
      systemPrompt: buildPromptSystem(section),
      userPayload: {
        level,
        section,
        topic,
        minWords: config.minWords,
        maxWords: config.maxWords,
        allowedTaskTypes: config.taskTypes,
        allowedRegisters: config.registers,
        weakAreas: payload.weakAreas ?? [],
        contextBlock: payload.contextBlock ?? '',
      },
      schema: writingPromptOutputSchema,
      maxAttempts: 2,
    });

    const rawPrompt = {
      ...data.prompt,
      level,
      examSection: isTefWritingSection(data.prompt?.examSection) ? data.prompt.examSection : section,
    };

    return {
      prompt: applySectionWordLimits(rawPrompt, rawPrompt.examSection),
    };
  },
};
