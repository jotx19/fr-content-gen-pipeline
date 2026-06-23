// @ts-nocheck
import { QdrantClient } from '@qdrant/js-client-rest';

export const COLLECTION_NAME = 'tef_memory';
export const VECTOR_SIZE = 1536;

declare global {
  // eslint-disable-next-line no-var
  var __qdrantClient: QdrantClient | null | undefined;
  // eslint-disable-next-line no-var
  var __qdrantReady: boolean | undefined;
  // eslint-disable-next-line no-var
  var __qdrantFailed: boolean | undefined;
  // eslint-disable-next-line no-var
  var __qdrantWarned: boolean | undefined;
  // eslint-disable-next-line no-var
  var __qdrantLastError: string | undefined;
}

function getState() {
  if (!global.__qdrantClient) global.__qdrantClient = null;
  if (global.__qdrantReady === undefined) global.__qdrantReady = false;
  if (global.__qdrantFailed === undefined) global.__qdrantFailed = false;
  if (global.__qdrantWarned === undefined) global.__qdrantWarned = false;
  return global;
}

/** Build URL candidates — Qdrant Cloud varies by region (443 vs 6333). */
function urlCandidates(raw) {
  const base = String(raw ?? '').trim().replace(/\/$/, '');
  if (!base) return [];

  const without6333 = base.replace(/:6333$/, '');
  const with6333 = without6333.includes(':6333') ? without6333 : `${without6333}:6333`;

  return [...new Set([without6333, with6333, base])];
}

async function connectClient() {
  const state = getState();
  if (state.__qdrantClient && state.__qdrantReady) return state.__qdrantClient;
  if (state.__qdrantFailed) return null;

  const apiKey = process.env.QDRANT_API_KEY || undefined;
  const candidates = urlCandidates(process.env.QDRANT_URL);

  if (!candidates.length) {
    if (!state.__qdrantWarned) {
      console.warn('[qdrant] QDRANT_URL not set — TEF memory disabled');
      state.__qdrantWarned = true;
    }
    state.__qdrantFailed = true;
    return null;
  }

  let lastError = '';

  for (const url of candidates) {
    try {
      const client = new QdrantClient({ url, apiKey, checkCompatibility: false });
      await client.getCollections();
      state.__qdrantClient = client;
      console.log(`[qdrant] connected (${url.replace(/:[^/]+@/, ':***@')})`);
      return client;
    } catch (err) {
      lastError = err?.message || String(err);
    }
  }

  state.__qdrantFailed = true;
  state.__qdrantLastError =
    lastError === 'Not Found' || lastError.includes('404')
      ? 'Cluster URL returned 404 — create a new cluster at cloud.qdrant.io and update QDRANT_URL + QDRANT_API_KEY (or remove QDRANT_URL to disable RAG)'
      : lastError;
  if (!state.__qdrantWarned) {
    console.warn(
      '[qdrant] init failed (RAG disabled):',
      lastError,
      '— verify cluster is active at cloud.qdrant.io and QDRANT_URL / QDRANT_API_KEY match the dashboard'
    );
    state.__qdrantWarned = true;
  }
  return null;
}

export async function ensureCollection() {
  const state = getState();
  const qdrant = await connectClient();
  if (!qdrant) return false;

  if (!state.__qdrantReady) {
    const collections = await qdrant.getCollections();
    const exists = collections.collections?.some((c) => c.name === COLLECTION_NAME);

    if (!exists) {
      await qdrant.createCollection(COLLECTION_NAME, {
        vectors: { size: VECTOR_SIZE, distance: 'Cosine' },
      });
      console.log(`[qdrant] created collection "${COLLECTION_NAME}"`);
    }

    state.__qdrantReady = true;
  }

  await ensurePayloadIndexes(qdrant);
  return true;
}

async function ensurePayloadIndexes(qdrant) {
  try {
    await qdrant.createPayloadIndex(COLLECTION_NAME, {
      field_name: 'userId',
      field_schema: 'keyword',
    });
  } catch (err) {
    const msg = err?.message || String(err);
    if (!msg.includes('already exists') && !msg.includes('AlreadyExists')) {
      console.warn('[qdrant] userId payload index:', msg);
    }
  }
}

export async function upsertEmbedding(id, vector, payload) {
  const ok = await ensureCollection().catch(() => false);
  if (!ok) return;

  const qdrant = getState().__qdrantClient;
  if (!qdrant || vector.length !== VECTOR_SIZE) return;

  await qdrant.upsert(COLLECTION_NAME, {
    wait: true,
    points: [{ id, vector, payload }],
  });
}

export async function searchSimilar(vector, topK = 5, userId = null) {
  const ok = await ensureCollection().catch(() => false);
  if (!ok) return [];

  const qdrant = getState().__qdrantClient;
  if (!qdrant) return [];

  const mapResults = (results) =>
    results.map((r) => ({
      score: r.score,
      payload: r.payload,
    }));

  if (userId) {
    try {
      const filtered = await qdrant.search(COLLECTION_NAME, {
        vector,
        limit: topK,
        filter: { must: [{ key: 'userId', match: { value: userId } }] },
        with_payload: true,
      });
      return mapResults(filtered);
    } catch (err) {
      const msg = err?.message || String(err);
      if (!msg.includes('Bad Request')) throw err;
      // Missing payload index — search all and filter in memory
      const all = await qdrant.search(COLLECTION_NAME, {
        vector,
        limit: Math.max(topK * 5, 20),
        with_payload: true,
      });
      return mapResults(all.filter((r) => r.payload?.userId === userId).slice(0, topK));
    }
  }

  const results = await qdrant.search(COLLECTION_NAME, {
    vector,
    limit: topK,
    with_payload: true,
  });

  return mapResults(results);
}

export function getQdrantStatus() {
  const state = getState();
  return {
    configured: Boolean(process.env.QDRANT_URL),
    ready: Boolean(state.__qdrantReady),
    failed: Boolean(state.__qdrantFailed),
    collection: COLLECTION_NAME,
    ...(state.__qdrantLastError ? { error: state.__qdrantLastError } : {}),
  };
}

/** Active probe — used by /api/health (retries connection if not yet ready). */
export async function probeQdrant() {
  const state = getState();
  if (!state.__qdrantReady) {
    state.__qdrantFailed = false;
    state.__qdrantClient = null;
  }
  await ensureCollection().catch((err) => {
    state.__qdrantLastError = err?.message || String(err);
  });
  return getQdrantStatus();
}
