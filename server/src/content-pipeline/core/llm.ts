// @ts-nocheck
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'openrouter/free';
const APP_TITLE = process.env.APP_TITLE || 'TEF Canada';

const MAX_RETRIES = 3;
const LLM_REQUEST_TIMEOUT_MS = Number(process.env.LLM_REQUEST_TIMEOUT_MS) || 90_000;

let lastRequestAt = 0;
const MIN_GAP_MS = Number(process.env.OPENROUTER_MIN_GAP_MS) || 2000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getModel(override) {
  if (override) return override;
  return process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
}

/** Fixed model for TEF subagents — tries fallbacks if primary is unavailable. */
export function getTefModelCandidates() {
  const candidates = [
    process.env.TEF_LLM_MODEL,
    process.env.OPENROUTER_MODEL,
    'google/gemini-2.5-flash',
    'google/gemini-2.5-flash-lite',
    'openrouter/free',
  ].filter(Boolean);
  return [...new Set(candidates)];
}

export function getTefModel() {
  return getTefModelCandidates()[0];
}

async function throttleRequests(skip = false) {
  if (skip) return;
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < MIN_GAP_MS) {
    await sleep(MIN_GAP_MS - elapsed);
  }
  lastRequestAt = Date.now();
}

function parseApiError(errText) {
  try {
    const parsed = JSON.parse(errText);
    return parsed.error?.message || errText;
  } catch {
    return errText;
  }
}

function isRetryableStatus(status) {
  return status === 429 || status === 502 || status === 503;
}

function finalErrorMessage(status, detail) {
  if (status === 429) {
    return (
      'OpenRouter rate limit reached. Wait 1–2 minutes and try again, ' +
      'or add credits at openrouter.ai/settings/credits.'
    );
  }
  return `OpenRouter API error ${status}: ${detail}`;
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
    'X-Title': APP_TITLE,
  };
}

function createSseParser(onToken) {
  let buffer = '';
  let fullText = '';

  return {
    push(chunk) {
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            fullText += delta;
            if (onToken) onToken(delta);
          }
        } catch {
          /* skip malformed SSE */
        }
      }
    },
    result() {
      return fullText;
    },
  };
}

async function consumeStream(body, onToken) {
  const parser = createSseParser(onToken);

  if (body && typeof body.getReader === 'function') {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      parser.push(decoder.decode(value, { stream: true }));
    }
    return parser.result();
  }

  if (body) {
    for await (const chunk of body) {
      parser.push(Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk));
    }
    return parser.result();
  }

  return '';
}

/**
 * Call LLM via OpenRouter. Used by TEF subagents for structured JSON generation.
 */
export async function callLLM(messages, systemPrompt = '', options = {}) {
  const {
    stream = false,
    onToken,
    model: modelOverride,
    skipThrottle = false,
    maxTokens,
  } = options;

  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const apiMessages = [];
  if (systemPrompt?.trim()) {
    apiMessages.push({ role: 'system', content: systemPrompt.trim() });
  }
  apiMessages.push(...messages);

  const model = getModel(modelOverride);
  const body = { model, messages: apiMessages, stream };
  if (maxTokens) body.max_tokens = maxTokens;

  let lastStatus = 0;
  let lastDetail = '';

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      await throttleRequests(skipThrottle);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), LLM_REQUEST_TIMEOUT_MS);

      let res;
      try {
        res = await fetch(OPENROUTER_URL, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(body),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      if (isRetryableStatus(res.status) && attempt < MAX_RETRIES) {
        const waitMs = 3000 * 2 ** attempt;
        console.warn(`[llm] ${res.status} on ${model} — retry ${attempt + 1}/${MAX_RETRIES} in ${waitMs}ms`);
        await sleep(waitMs);
        continue;
      }

      if (!res.ok) {
        const errText = await res.text();
        lastStatus = res.status;
        lastDetail = parseApiError(errText);
        throw new Error(finalErrorMessage(res.status, lastDetail));
      }

      if (stream && res.body) {
        const text = await consumeStream(res.body, onToken);
        console.log(`[llm] success (${model})`);
        return text;
      }
      const json = await res.json();
      console.log(`[llm] success (${model})`);
      return json.choices?.[0]?.message?.content ?? '';
    } catch (err) {
      if (err.name === 'AbortError') {
        lastDetail = `timed out after ${LLM_REQUEST_TIMEOUT_MS}ms`;
        if (attempt < MAX_RETRIES) {
          await sleep(2000 * 2 ** attempt);
          continue;
        }
        throw new Error(`LLM request timed out (${model})`);
      }
      if (err.message?.includes('OpenRouter')) throw err;
      lastDetail = err.message;
      if (attempt < MAX_RETRIES) {
        await sleep(2000 * 2 ** attempt);
        continue;
      }
      throw new Error(`LLM request failed: ${err.message}`);
    }
  }

  throw new Error(finalErrorMessage(lastStatus || 429, lastDetail));
}
