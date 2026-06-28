// @ts-nocheck
import { WRITING_CRITERIA } from './writingScore.js';

function normalizeAnswer(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, "'")
    .replace(/\s+/g, ' ');
}

function answersMatch(user: string, expected: string) {
  const a = normalizeAnswer(user);
  const b = normalizeAnswer(expected);
  if (!a || !b) return false;
  if (a === b) return true;
  return a.replace(/\s/g, '') === b.replace(/\s/g, '');
}

export function scoreFillBlanks(
  blanks: { id: string; acceptableAnswers?: string[] }[],
  answers: Record<string, string>
) {
  const rows = blanks.map((blank) => {
    const user = String(answers[blank.id] ?? '').trim();
    const acceptable = blank.acceptableAnswers ?? [];
    const correct =
      user.length > 0 &&
      acceptable.some((candidate) => answersMatch(user, candidate));
    return { id: blank.id, user, correct };
  });

  const correctCount = rows.filter((r) => r.correct).length;
  const total = Math.max(blanks.length, 1);
  const accuracy = correctCount / total;
  const score = Math.round(accuracy * 100);

  const criteria = [
    {
      criterion: 'task_fulfillment',
      label: 'Task Fulfillment',
      score,
      feedback:
        correctCount === total
          ? 'All blanks filled correctly.'
          : `${correctCount}/${total} blanks correct — check word form and spelling.`,
    },
    {
      criterion: 'language_accuracy',
      label: 'Language Accuracy',
      score: Math.max(0, score - (total - correctCount) * 8),
      feedback:
        correctCount === total
          ? 'Forms and spelling look good for this level.'
          : 'Review verb forms, articles, and spelling for missed blanks.',
    },
    {
      criterion: 'vocabulary',
      label: 'Vocabulary',
      score: Math.min(100, score + (correctCount > 0 ? 5 : 0)),
      feedback: 'Vocabulary matched the expected A1 word choices.',
    },
    {
      criterion: 'content_coherence',
      label: 'Content / Coherence',
      score: Math.min(100, score + 4),
      feedback: 'Paragraph meaning is clear when blanks are filled correctly.',
    },
  ];

  const labels = Object.fromEntries(WRITING_CRITERIA.map((c) => [c.key, c.label]));
  for (const row of criteria) {
    row.label = labels[row.criterion] ?? row.label;
  }

  const filledText = rows
    .map((r) => `${r.id}: ${r.user || '—'} (${r.correct ? 'ok' : 'miss'})`)
    .join('\n');

  return {
    criteria,
    overallScore: Math.round(criteria.reduce((a, c) => a + c.score, 0) / criteria.length),
    summary:
      correctCount === total
        ? `Perfect — ${correctCount}/${total} blanks correct.`
        : `${correctCount}/${total} blanks correct. Keep practicing short word forms.`,
    suggestions:
      correctCount === total
        ? ['Try the sentence-writing level next when you have enough writing XP.']
        : [
            'Re-read the hint in parentheses for each blank.',
            'Check accents and apostrophes (je m\'appelle, j\'habite…).',
            'Use one or two words only per blank.',
          ],
    filledSummary: filledText,
    wordCount: Object.values(answers).join(' ').trim().split(/\s+/).filter(Boolean).length,
  };
}

export function composeFillBlankSubmission(
  paragraphParts: { type: string; value?: string; id?: string }[],
  answers: Record<string, string>
) {
  return paragraphParts
    .map((part) => {
      if (part.type === 'text') return part.value ?? '';
      if (part.type === 'blank') return String(answers[part.id ?? ''] ?? '').trim() || '___';
      return '';
    })
    .join('');
}
