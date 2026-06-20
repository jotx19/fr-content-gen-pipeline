// @ts-nocheck
import { CEFR_LEVELS } from '../subagents/schemas.js';
import { normalizeSkillTag } from '../subagents/normalize.js';

/**
 * Score MCQs locally — no LLM. Questions must include correctIndex + skillTag.
 */
export function scoreMcqBatch(questions, userAnswers) {
  if (!Array.isArray(questions) || !Array.isArray(userAnswers)) {
    throw new Error('questions and userAnswers arrays are required');
  }
  if (questions.length !== userAnswers.length) {
    throw new Error('questions and userAnswers must have the same length');
  }

  const skillStats = new Map();

  const results = questions.map((q, i) => {
    const skillTag = normalizeSkillTag(q.skillTag);
    const correct = userAnswers[i] === q.correctIndex;
    const stat = skillStats.get(skillTag) || { correct: 0, total: 0 };
    stat.total += 1;
    if (correct) stat.correct += 1;
    skillStats.set(skillTag, stat);

    return {
      questionIndex: i,
      correct,
      skillTag,
      explanation: q.explanation || undefined,
    };
  });

  const totalCorrect = results.filter((r) => r.correct).length;
  const overallAccuracy = questions.length ? totalCorrect / questions.length : 0;

  const skillBreakdown = [...skillStats.entries()].map(([skillTag, s]) => ({
    skillTag,
    correct: s.correct,
    total: s.total,
    accuracy: s.total ? s.correct / s.total : 0,
  }));

  skillBreakdown.sort((a, b) => a.accuracy - b.accuracy);

  const weakAreas = skillBreakdown
    .filter((s) => s.accuracy < 0.6)
    .map((s) => s.skillTag)
    .slice(0, 3);

  if (!weakAreas.length && skillBreakdown.length) {
    weakAreas.push(skillBreakdown[0].skillTag);
  }

  return { results, skillBreakdown, weakAreas, overallAccuracy };
}

/** Strip answer keys before sending questions to the client. */
export function publicQuestions(questions) {
  return questions.map((q, i) => ({
    id: q.id || `q${i + 1}`,
    question: q.question,
    options: q.options,
    skillTag: q.skillTag,
  }));
}

/** Estimate CEFR level from placement accuracy (deterministic). */
export function levelFromPlacement(overallAccuracy) {
  const a = overallAccuracy;
  let level = 'A2';
  let confidence = 0.6;

  if (a >= 0.9) {
    level = 'C1';
    confidence = 0.85;
  } else if (a >= 0.8) {
    level = 'B2';
    confidence = 0.8;
  } else if (a >= 0.65) {
    level = 'B1';
    confidence = 0.75;
  } else if (a >= 0.45) {
    level = 'A2';
    confidence = 0.7;
  } else {
    level = 'A1';
    confidence = 0.65;
  }

  if (!CEFR_LEVELS.includes(level)) level = 'B1';

  return { level, confidence };
}

export function buildEnglishSummary({ overallAccuracy, level, weakAreas, kind = 'practice' }) {
  const pct = Math.round(overallAccuracy * 100);
  const focus =
    weakAreas?.length > 0
      ? ` Focus areas: ${weakAreas.join(', ')}.`
      : '';
  if (kind === 'placement') {
    return `Placement complete. You scored ${pct}%. Estimated level: ${level}.${focus}`;
  }
  return `You scored ${pct}% on this session.${focus}`;
}
