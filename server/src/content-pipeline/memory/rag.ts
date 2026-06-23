// @ts-nocheck
import { randomUUID } from 'crypto';
import { ensureCollection, upsertEmbedding, searchSimilar } from '../../app/db/qdrant.js';
import { sanitizeText } from '../core/sanitize.js';
import { getAppName } from '../core/persona.js';

const EMBEDDINGS_URL = 'https://openrouter.ai/api/v1/embeddings';
const EMBEDDING_MODEL = 'openai/text-embedding-3-small';

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
    'X-Title': getAppName(),
  };
}

export async function embedText(text) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const input = sanitizeText(text, 8000);

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(EMBEDDINGS_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ model: EMBEDDING_MODEL, input }),
    });

    if (res.status === 429 && attempt < 2) {
      await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt));
      continue;
    }

    if (!res.ok) {
      if (res.status === 429) {
        throw new Error('Embedding rate limit — TEF memory indexing skipped');
      }
      const errText = await res.text();
      throw new Error(`Embedding API error ${res.status}: ${errText}`);
    }

    const json = await res.json();
    const vector = json.data?.[0]?.embedding;
    if (!vector?.length) throw new Error('Embedding API returned empty vector');
    return vector;
  }

  throw new Error('embedText failed after retries');
}

/**
 * Index a completed TEF session for adaptive recall.
 */
export async function storeSessionMemory(userId, data) {
  if (!process.env.QDRANT_URL || !userId) return;

  const {
    kind = 'session',
    level,
    overallAccuracy,
    weakAreas = [],
    summary = '',
    skillBreakdown = [],
  } = data;

  const content = sanitizeText(
    [
      `TEF ${kind} session`,
      level ? `Level: ${level}` : '',
      overallAccuracy != null ? `Accuracy: ${Math.round(overallAccuracy * 100)}%` : '',
      weakAreas.length ? `Weak areas: ${weakAreas.join(', ')}` : '',
      skillBreakdown.length
        ? skillBreakdown.map((s) => `${s.skillTag}: ${s.correct}/${s.total}`).join('; ')
        : '',
      summary,
    ]
      .filter(Boolean)
      .join('. ')
  );

  if (!content) return;

  try {
    await ensureCollection();
    const vector = await embedText(content);
    await upsertEmbedding(randomUUID(), vector, {
      userId,
      kind,
      level: level ?? null,
      weakAreas,
      content,
      overallAccuracy: overallAccuracy ?? null,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[rag] storeSessionMemory failed:', err.message);
  }
}

/**
 * Retrieve prior learner context for question generation or review.
 */
export async function retrieveLearnerContext(userId, query, topK = 5) {
  if (!process.env.QDRANT_URL || !userId) return [];

  try {
    await ensureCollection();
    const vector = await embedText(sanitizeText(query, 2000));
    const hits = await searchSimilar(vector, topK, userId);

    return hits
      .filter((h) => h.score >= 0.55)
      .map((h) => ({
        content: h.payload?.content ?? '',
        kind: h.payload?.kind ?? 'session',
        level: h.payload?.level ?? null,
        score: h.score,
      }));
  } catch (err) {
    console.warn('[rag] retrieveLearnerContext failed:', err.message);
    return [];
  }
}

export function formatLearnerContextBlock(notes = []) {
  if (!notes.length) return '';
  const lines = notes.map((n, i) => `[${i + 1}] (${n.kind}${n.level ? `, ${n.level}` : ''}) ${n.content}`);
  return `Prior learner history (use to avoid repetition and target weak skills):\n${lines.join('\n')}`;
}
