import { sanitizeSearchQuery } from '../core/sanitize.js';

const TIMEOUT_MS = 5000;

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Wikipedia search tool — used standalone or as websearch fallback.
 */
export async function searchWikipedia(query: string) {
  const q = sanitizeSearchQuery(query);
  if (!q) return null;

  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*`;
  const res = await fetchWithTimeout(url, { headers: { 'User-Agent': 'tef-agent/3.0' } });
  if (!res.ok) return null;

  const json = await res.json();
  const hits = json.query?.search ?? [];
  const snippets = hits
    .slice(0, 3)
    .map((h: { title: string; snippet?: string }) =>
      `${h.title}: ${h.snippet?.replace(/<[^>]+>/g, '') ?? ''}`
    );
  if (!snippets.length) return null;

  return {
    snippets,
    sources: hits
      .slice(0, 3)
      .map(
        (h: { title: string }) =>
          `https://en.wikipedia.org/wiki/${encodeURIComponent(h.title.replace(/ /g, '_'))}`
      ),
  };
}

export default {
  name: 'wikipedia',
  description: 'Search Wikipedia for TEF topic context',
  async run(input: { query?: string } | string) {
    const query = sanitizeSearchQuery(typeof input === 'string' ? input : input?.query);
    if (!query) throw new Error('Search query is required');
    const result = await searchWikipedia(query);
    if (!result) return { snippets: [], sources: [], contextBlock: '' };
    const contextBlock = [
      'Wikipedia reference snippets (inform topics only — do not copy verbatim):',
      ...result.snippets.map((s, i) => `[${i + 1}] ${s}`),
    ].join('\n');
    return { ...result, contextBlock };
  },
};
