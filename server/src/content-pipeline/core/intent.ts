// @ts-nocheck
/**
 * TEF learning intents — route generation, RAG recall, and web research.
 */

export const TEF_INTENTS = ['PLACEMENT', 'PRACTICE', 'REVIEW', 'RESEARCH', 'SCORE'];

const ACTION_INTENT = {
  placement: 'PLACEMENT',
  practice: 'PRACTICE',
  submit_placement: 'SCORE',
  submit_practice: 'SCORE',
  profile: 'REVIEW',
  prefetch: 'PRACTICE',
};

/**
 * Map orchestrator action to TEF intent.
 */
export function resolveTefIntent(action, { weakAreas = [] } = {}) {
  const base = ACTION_INTENT[action] ?? 'PRACTICE';

  if (base === 'PRACTICE' && weakAreas.length > 0) {
    return 'REVIEW';
  }

  return base;
}

/**
 * Decide whether to pull RAG memory and/or web search for generation.
 */
export function planEnrichment(intent, { weakAreas = [], topic = '' } = {}) {
  const useRag = intent === 'REVIEW' || intent === 'PRACTICE' || intent === 'PLACEMENT';
  const useSearch =
    process.env.TEF_USE_WEBSEARCH !== 'false' &&
    (intent === 'RESEARCH' ||
      intent === 'PRACTICE' ||
      (intent === 'REVIEW' && weakAreas.length > 0));

  const searchQuery =
    useSearch && topic
      ? `TEF Canada exam ${topic} French formal ${weakAreas[0] ?? ''}`.trim()
      : null;

  return { intent, useRag, useSearch, searchQuery };
}

/**
 * Build generation context from RAG + web search for subagents.
 */
export async function buildGenerationContext({
  userId,
  action,
  level,
  weakAreas = [],
  topic = '',
}) {
  const intent = resolveTefIntent(action, { weakAreas });
  const plan = planEnrichment(intent, { weakAreas, topic });

  const context = {
    intent,
    ragNotes: [],
    researchSnippets: [],
    contextBlock: '',
  };

  if (plan.useRag && userId) {
    const { retrieveLearnerContext, formatLearnerContextBlock } = await import('../memory/rag.js');
    const query = `${topic} ${weakAreas.join(' ')} level ${level ?? ''}`.trim();
    context.ragNotes = await retrieveLearnerContext(userId, query || 'TEF practice history');
    const ragBlock = formatLearnerContextBlock(context.ragNotes);
    if (ragBlock) context.contextBlock += `${ragBlock}\n\n`;
  }

  if (plan.useSearch && plan.searchQuery) {
    const { searchTefTopic } = await import('../tools/websearch.js');
    const search = await searchTefTopic({
      query: plan.searchQuery,
      level,
      weakAreas,
    });
    context.researchSnippets = search.snippets ?? [];
    if (search.contextBlock) {
      context.contextBlock += `${search.contextBlock}\n\n`;
    }
  }

  return context;
}
