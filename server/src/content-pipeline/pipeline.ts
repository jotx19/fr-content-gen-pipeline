import { buildAgentContext } from './agent/context.js';
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
      const genCtx = await buildAgentContext({
        userId: opts.userId,
        action: 'practice',
        level: input.level as string,
        weakAreas: (input.weakAreas as string[]) ?? [],
        topic: (input.topic as string) ?? 'formal French writing',
      });

      const { result } = await spawnSubagent('writingPrompt', {
        level: input.level,
        topic: input.topic,
        weakAreas: input.weakAreas,
        contextBlock: genCtx.contextBlock,
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
