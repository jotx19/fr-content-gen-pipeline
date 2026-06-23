// @ts-nocheck
/**
 * Input/output sanitization for TEF flows (user ids, search queries, MCQ text).
 */

const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
const HTML_TAGS = /<[^>]*>/g;

export function sanitizeText(input, maxLen = 8000) {
  return String(input ?? '')
    .replace(CONTROL_CHARS, '')
    .replace(HTML_TAGS, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

export function sanitizeUserId(id) {
  const clean = sanitizeText(id, 128).replace(/[^a-zA-Z0-9-_]/g, '');
  if (!clean) throw new Error('Invalid userId');
  return clean;
}

export function sanitizeSearchQuery(query) {
  return sanitizeText(query, 500);
}

export function sanitizeMcqField(text, maxLen = 2000) {
  return sanitizeText(text, maxLen);
}

/** Strip risky patterns from LLM JSON text before parsing. */
export function sanitizeLlmOutput(raw) {
  let text = String(raw ?? '');
  text = text.replace(CONTROL_CHARS, '');
  // Drop script-like payloads sometimes leaked by models
  text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
  return text.trim();
}

/** Sanitize a full MCQ batch in place. */
export function sanitizeMcqBatch(questions = []) {
  return questions.map((q) => ({
    ...q,
    id: q.id ? sanitizeMcqField(q.id, 32) : q.id,
    question: sanitizeMcqField(q.question),
    options: (q.options ?? []).map((o) => sanitizeMcqField(o, 500)),
    explanation: q.explanation ? sanitizeMcqField(q.explanation, 1500) : q.explanation,
    skillTag: q.skillTag,
    correctIndex: q.correctIndex,
    register: q.register,
  }));
}
