import { sanitizeSearchQuery } from '../core/sanitize.js';
import { searchWikipedia } from './wikipedia.js';

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

async function searchSerper(query: string) {
  const key = process.env.SERPER_API_KEY;
  if (!key) return null;

  const res = await fetchWithTimeout('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query, num: 5 }),
  });

  if (!res.ok) return null;
  const json = await res.json();
  const snippets = (json.organic ?? []).map((r: { snippet?: string; title?: string }) => r.snippet || r.title).filter(Boolean);
  const sources = (json.organic ?? []).map((r: { link?: string }) => r.link).filter(Boolean);
  if (!snippets.length) return null;

  return { snippets: snippets.slice(0, 5), sources: [...new Set(sources)] };
}

async function searchDuckDuckGo(query: string) {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`;
  const res = await fetchWithTimeout(url, { headers: { 'User-Agent': 'tef-agent/3.0' } });
  if (!res.ok) return null;

  const json = await res.json();
  const snippets: string[] = [];
  const sources: string[] = [];

  if (json.AbstractText) {
    snippets.push(json.AbstractText);
    if (json.AbstractURL) sources.push(json.AbstractURL);
  }

  for (const t of json.RelatedTopics ?? []) {
    if (t.Text) snippets.push(t.Text);
    if (t.FirstURL) sources.push(t.FirstURL);
    if (snippets.length >= 5) break;
  }

  if (!snippets.length) return null;
  return { snippets: snippets.slice(0, 5), sources: [...new Set(sources)] };
}

const PROVIDERS = [
  { name: 'searchSerper', fn: searchSerper },
  { name: 'searchWikipedia', fn: searchWikipedia },
  { name: 'searchDuckDuckGo', fn: searchDuckDuckGo },
];

export async function searchTefTopic({
  query,
  level,
  weakAreas = [],
}: {
  query: string;
  level?: string;
  weakAreas?: string[];
}) {
  const base = sanitizeSearchQuery(query);
  if (!base) return { snippets: [], sources: [], contextBlock: '' };

  const enriched = [base, level ? `CEFR ${level}` : '', weakAreas[0] ?? '']
    .filter(Boolean)
    .join(' ');

  for (const provider of PROVIDERS) {
    try {
      const result = await provider.fn(enriched);
      if (!result?.snippets?.length) continue;

      console.log(`[websearch] TEF topic context via ${provider.name}`);
      const contextBlock = [
        'External reference snippets (inform question topics only — do not copy verbatim):',
        ...result.snippets.map((s: string, i: number) => `[${i + 1}] ${s}`),
      ].join('\n');

      return { snippets: result.snippets, sources: result.sources ?? [], contextBlock };
    } catch (err) {
      console.warn(`[websearch] ${provider.name} failed:`, err instanceof Error ? err.message : err);
    }
  }

  return { snippets: [], sources: [], contextBlock: '' };
}

export default {
  name: 'websearch',
  description: 'TEF topic research via Serper, Wikipedia, or DuckDuckGo',
  async run(input: { query?: string } | string) {
    const query = sanitizeSearchQuery(typeof input === 'string' ? input : input?.query);
    if (!query) throw new Error('Search query is required');
    return searchTefTopic({ query });
  },
};
