// @ts-nocheck
/**
 * Content guardrails for TEF MCQ batches before they reach learners.
 */

const FRENCH_HINT =
  /[àâäæçéèêëïîôùûüœ]|(\b(le|la|les|un|une|des|du|de|et|est|dans|pour|que|qui|avec|sur|par|ne|pas|vous|nous|ils|elles|ce|cette|son|sa|ses|leur|leurs|avoir|être|fait|très|bien|aussi|comme|mais|ou|où|quoi|comment|pourquoi|quand|quel|quelle|quels|quelles)\b)/i;

const BLOCKED_PATTERNS = [
  /\b(kill|suicide|bomb|terror|hack\s+into|password\s+steal)\b/i,
  /<script/i,
  /javascript:/i,
];

function looksFrench(text) {
  const t = String(text ?? '').trim();
  if (t.length < 8) return true;
  return FRENCH_HINT.test(t);
}

function hasBlockedContent(text) {
  return BLOCKED_PATTERNS.some((re) => re.test(String(text ?? '')));
}

export function guardMcqQuestion(q, { requireFrench = true } = {}) {
  const issues = [];

  if (!q?.question?.trim()) issues.push('empty question');
  if (!Array.isArray(q?.options) || q.options.length !== 4) {
    issues.push('must have exactly 4 options');
  } else {
    q.options.forEach((opt, i) => {
      if (!String(opt ?? '').trim()) issues.push(`empty option ${i}`);
    });
  }

  if (typeof q?.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex > 3) {
    issues.push('correctIndex must be 0–3');
  }

  if (requireFrench && q?.question && !looksFrench(q.question)) {
    issues.push('question should be in French');
  }

  for (const field of [q?.question, ...(q?.options ?? []), q?.explanation]) {
    if (field && hasBlockedContent(field)) {
      issues.push('blocked content detected');
      break;
    }
  }

  return issues;
}

export function guardMcqBatch(questions, kind = 'practice') {
  if (!Array.isArray(questions) || !questions.length) {
    return { ok: false, issues: [{ index: -1, issues: ['empty batch'] }] };
  }

  const requireFrench = kind !== 'evaluator';
  const issues = [];

  questions.forEach((q, index) => {
    const qIssues = guardMcqQuestion(q, { requireFrench });
    if (qIssues.length) issues.push({ index, issues: qIssues });
  });

  // Dedupe: no identical question stems in one batch
  const stems = new Set();
  questions.forEach((q, index) => {
    const stem = String(q.question ?? '').trim().toLowerCase();
    if (stem && stems.has(stem)) {
      issues.push({ index, issues: ['duplicate question stem'] });
    }
    if (stem) stems.add(stem);
  });

  return { ok: issues.length === 0, issues };
}

export function guardPlacementBatch(questions) {
  return guardMcqBatch(questions, 'placement');
}
