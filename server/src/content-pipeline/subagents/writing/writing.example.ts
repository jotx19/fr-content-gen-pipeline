// @ts-nocheck
import { callStructuredSubagent } from '../shared/client.js';
import { writingExampleOutputSchema } from './writing.schemas.js';

const EXAMPLE_SYSTEM = `Write a model answer for a TCF / TEF expression écrite prompt.

Rules:
- French only in exampleAnswer
- Match the prompt level, register, task type, and word count (minWords–maxWords)
- Demonstrate strong performance on all four criteria but keep it realistic for the level (not C2 quality at B1)
- notes: 1–2 English sentences on why this answer works

Output only:
{"exampleAnswer":"...","wordCount":150,"notes":"..."}`;

export default {
  name: 'writingExample',
  description: 'Generate a model answer for a writing prompt',
  async run(input) {
    const payload = typeof input === 'string' ? JSON.parse(input) : input ?? {};

    return callStructuredSubagent({
      systemPrompt: EXAMPLE_SYSTEM,
      userPayload: {
        prompt: payload.prompt,
        level: payload.level,
      },
      schema: writingExampleOutputSchema,
      maxAttempts: 2,
    });
  },
};
