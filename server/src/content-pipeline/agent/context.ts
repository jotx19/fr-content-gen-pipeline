import { buildGenerationContext as buildIntentContext } from '../core/intent.js';
import { resolveTefIntent, planEnrichment } from '../core/intent.js';

export type AgentAction =
  | 'placement'
  | 'practice'
  | 'submit_placement'
  | 'submit_practice'
  | 'profile'
  | 'prefetch';

export type ContextParams = {
  userId: string;
  action: AgentAction;
  level?: string;
  weakAreas?: string[];
  topic?: string;
};

/**
 * Build enriched context block for subagents (RAG + web tools).
 */
export async function buildAgentContext(params: ContextParams) {
  return buildIntentContext({ ...params, level: params.level ?? '' });
}

export { resolveTefIntent, planEnrichment };
