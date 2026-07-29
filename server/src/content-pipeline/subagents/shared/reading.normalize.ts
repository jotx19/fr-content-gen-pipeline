// @ts-nocheck
export const SKILL_TAGS = [
  'grammaire',
  'vocabulaire',
  'compréhension écrite',
  'compréhension orale',
  'expression écrite',
  'expression orale',
];

const SKILL_ALIASES = [
  ['grammaire', 'grammaire'],
  ['vocabulaire', 'vocabulaire'],
  ['compréhension écrite', 'compréhension écrite'],
  ['comprehension ecrite', 'compréhension écrite'],
  ['compréhension orale', 'compréhension orale'],
  ['comprehension orale', 'compréhension orale'],
  ['expression écrite', 'expression écrite'],
  ['expression ecrite', 'expression écrite'],
  ['expression orale', 'expression orale'],
  ['rédaction', 'expression écrite'],
  ['redaction', 'expression écrite'],
  ['lecture', 'compréhension écrite'],
  ['écrit', 'compréhension écrite'],
  ['ecrit', 'compréhension écrite'],
  ['oral', 'compréhension orale'],
];

function stripAccents(s) {
  return String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Map free-text skill labels to one of the six allowed TEF skill tags. */
export function normalizeSkillTag(tag) {
  if (!tag) return 'compréhension écrite';

  const raw = String(tag).trim();
  if (SKILL_TAGS.includes(raw)) return raw;

  const flat = stripAccents(raw);
  for (const [needle, canonical] of SKILL_ALIASES) {
    if (flat === stripAccents(needle) || flat.includes(stripAccents(needle))) {
      return canonical;
    }
  }

  if (flat.includes('grammaire')) return 'grammaire';
  if (flat.includes('vocabulaire')) return 'vocabulaire';
  if (flat.includes('orale')) return flat.includes('expression') ? 'expression orale' : 'compréhension orale';
  if (flat.includes('ecrite') || flat.includes('écrit')) {
    return flat.includes('expression') ? 'expression écrite' : 'compréhension écrite';
  }

  return 'compréhension écrite';
}

/** Keep exactly 4 non-empty option strings. */
export function normalizeOptions(options) {
  if (!Array.isArray(options)) return null;
  const cleaned = options.map((o) => String(o ?? '').trim()).filter(Boolean);
  if (cleaned.length < 4) return null;
  return cleaned.slice(0, 4);
}

/** Fisher–Yates shuffle options; keep correctIndex pointing at the same answer. */
export function shuffleMcqOptions(question) {
  if (!question || !Array.isArray(question.options) || question.options.length < 2) {
    return question;
  }

  const options = [...question.options];
  let correctIndex = Math.min(
    options.length - 1,
    Math.max(0, Number(question.correctIndex) || 0)
  );

  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
    if (correctIndex === i) correctIndex = j;
    else if (correctIndex === j) correctIndex = i;
  }

  return { ...question, options, correctIndex };
}

export function normalizePlacementOutput(parsed) {
  return normalizePlacementBatch(parsed);
}

export function normalizePlacementBatch(parsed) {
  if (!parsed?.questions || !Array.isArray(parsed.questions)) return parsed;

  const questions = parsed.questions
    .map((q, i) => {
      const options = normalizeOptions(q?.options);
      if (!options || !q?.question) return null;
      return shuffleMcqOptions({
        id: String(q.id || `q${i + 1}`),
        question: String(q.question).trim(),
        options,
        correctIndex: Math.min(3, Math.max(0, Number(q.correctIndex) || 0)),
        skillTag: normalizeSkillTag(q.skillTag),
        ...(q.explanation ? { explanation: String(q.explanation).trim() } : {}),
      });
    })
    .filter(Boolean);

  return { questions };
}

export function normalizeMcqBatch(parsed) {
  if (!parsed?.questions || !Array.isArray(parsed.questions)) return parsed;

  return {
    questions: parsed.questions
      .map((q, i) => {
        const options = normalizeOptions(q?.options);
        if (!options || !q?.question) return null;
        return shuffleMcqOptions({
          question: String(q.question).trim(),
          options,
          correctIndex: Math.min(3, Math.max(0, Number(q.correctIndex) || 0)),
          explanation: String(q.explanation ?? '').trim() || 'See correct answer.',
          skillTag: normalizeSkillTag(q.skillTag),
        });
      })
      .filter(Boolean),
  };
}
