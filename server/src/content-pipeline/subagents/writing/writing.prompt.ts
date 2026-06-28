// @ts-nocheck
import { callStructuredSubagent } from '../shared/client.js';
import { getTefModel } from '../../core/llm.js';
import { writingPromptOutputSchema } from './writing.schemas.js';
import {
  applySectionWordLimits,
  isTefWritingSection,
  resolveTefWritingSection,
  tefWritingSectionConfig,
} from './tefWritingSections.js';
import { taskModeForWritingLevel } from '../../../services/writing/scoring/writingXp.js';
import { ensureFillBlankPrompt } from '../../../services/writing/normalizeFillBlankPrompt.js';
import {
  pickFillBlankTemplate,
  pickSentenceTemplate,
} from '../../../services/writing/prompts/writingPromptTemplates.js';

function buildFullPromptSystem(sectionKey) {
  const section = tefWritingSectionConfig(sectionKey);
  return `Generate one TEF Canada expression écrite writing task as JSON for Section ${sectionKey}.
Section ${sectionKey}: ${section.description}
Set minWords=${section.minWords}, maxWords=${section.maxWords}, examSection="${sectionKey}", taskMode "full".
French for title/instructions/prompt. Output only valid JSON.`;
}

export default {
  name: 'writingPrompt',
  description: 'Generate a level-appropriate writing prompt (A1/A2 instant templates, B1+ LLM)',
  async run(input) {
    const payload = typeof input === 'string' ? JSON.parse(input) : input ?? {};
    const level = String(payload.level || 'B1');
    const taskMode = taskModeForWritingLevel(level);
    const seed = String(payload.seed ?? payload.userId ?? Date.now());
    const previousPromptId = payload.previousPromptId ?? null;

    if (taskMode === 'fill_blanks') {
      return {
        prompt: ensureFillBlankPrompt(pickFillBlankTemplate(seed, previousPromptId)),
      };
    }

    if (taskMode === 'sentences') {
      return { prompt: pickSentenceTemplate(seed, previousPromptId) };
    }

    const section = resolveTefWritingSection(
      payload.section,
      isTefWritingSection(payload.lastSection) ? payload.lastSection : null
    );
    const config = tefWritingSectionConfig(section);
    const topic = payload.topic ?? 'daily life in Canada';

    const data = await callStructuredSubagent({
      systemPrompt: buildFullPromptSystem(section),
      userPayload: { level, section, topic, minWords: config.minWords, maxWords: config.maxWords },
      schema: writingPromptOutputSchema,
      maxAttempts: 1,
      models: [getTefModel()],
    });

    const rawPrompt = {
      ...data.prompt,
      level,
      taskMode: 'full',
      examSection: isTefWritingSection(data.prompt?.examSection) ? data.prompt.examSection : section,
    };

    return { prompt: applySectionWordLimits(rawPrompt, rawPrompt.examSection) };
  },
};
