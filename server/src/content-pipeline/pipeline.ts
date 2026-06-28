import { spawnSubagent } from './agent/subagent_spawn.js';

/** Discriminator for content-pipeline service requests — modules pass this + input payload */
export const PIPELINE_SERVICES = {
  WRITING_GENERATE_PROMPT: 'writing.generatePrompt',
  WRITING_EVALUATE: 'writing.evaluate',
  WRITING_EXAMPLE_ANSWER: 'writing.exampleAnswer',
  READING_PLACEMENT: 'reading.placement',
  READING_PRACTICE: 'reading.practice',
  READING_EVALUATE: 'reading.evaluate',
} as const;

export type PipelineService = (typeof PIPELINE_SERVICES)[keyof typeof PIPELINE_SERVICES];

export type ContentPipelineRequest = {
  service: PipelineService;
  userId: string;
  input?: Record<string, unknown>;
};

export type ContentPipelineResult = Record<string, unknown>;

/**
 * Unified content-pipeline entry — services declare `service` type; pipeline returns client-ready data.
 */
export async function runContentPipeline(
  opts: ContentPipelineRequest
): Promise<ContentPipelineResult> {
  const input = opts.input ?? {};

  switch (opts.service) {
    case PIPELINE_SERVICES.WRITING_GENERATE_PROMPT: {
      const { result } = await spawnSubagent('writingPrompt', {
        userId: opts.userId,
        level: input.level,
        topic: input.topic,
        section: input.section,
        lastSection: input.lastSection,
        weakAreas: input.weakAreas,
        previousPromptId: input.previousPromptId,
        seed: `${opts.userId}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
      });

      return { prompt: result.prompt, context: { topic: input.topic } };
    }

    case PIPELINE_SERVICES.WRITING_EVALUATE: {
      const { result } = await spawnSubagent('writingEvaluator', {
        prompt: input.prompt,
        submission: input.submission,
        wordCount: input.wordCount,
        level: input.level,
      });

      return result;
    }

    case PIPELINE_SERVICES.WRITING_EXAMPLE_ANSWER: {
      const { result } = await spawnSubagent('writingExample', {
        prompt: input.prompt,
        level: input.level,
      });

      return result;
    }

    default:
      throw new Error(`Unsupported pipeline service: ${opts.service}`);
  }
}
