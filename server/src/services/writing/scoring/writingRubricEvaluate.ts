// @ts-nocheck
import { inferTefWritingSection } from '../../../content-pipeline/subagents/writing/tefWritingSections.js';
import { WRITING_CRITERIA } from './writingScore.js';
import {
  applyWordCountToEvaluation,
  assessWordCountCompliance,
  resolveWordCountRequirements,
  wordCountFeedback,
} from './writingWordCount.js';
import {
  ADVANCED_VOCAB_MARKERS,
  ANGLICISM_MARKERS,
  COMPLEXITY_MARKERS,
  CONNECTORS_BY_LEVEL,
  DISCOURSE_MARKERS,
  FORMAL_CLOSINGS,
  FORMAL_OPENERS,
  FRENCH_STOPWORDS,
  GRAMMAR_PATTERNS,
  LEVEL_MIN_CONNECTORS,
  LEVEL_MIN_DIVERSITY,
  OPINION_MARKERS,
  REQUEST_MARKERS,
  TASK_TYPE_MARKERS,
} from './writingRubricTemplates.js';

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function labelFor(key: string) {
  return WRITING_CRITERIA.find((c) => c.key === key)?.label ?? key;
}

function buildCriteria(scores: Record<string, { score: number; feedback: string }>) {
  return Object.entries(scores).map(([criterion, row]) => ({
    criterion,
    label: labelFor(criterion),
    score: row.score,
    feedback: row.feedback,
  }));
}

function extractKeywords(text: string, limit = 14) {
  const words = normalize(text)
    .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !FRENCH_STOPWORDS.has(w));
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([w]) => w);
}

function countMatches(text: string, phrases: string[]) {
  const norm = normalize(text);
  return phrases.filter((p) => norm.includes(normalize(p))).length;
}

function frenchTextRatio(text: string) {
  const letters = text.match(/\p{L}/gu)?.length ?? 0;
  if (!letters) return 0;
  const french = text.match(/[a-zàâäéèêëïîôùûüçA-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ]/g)?.length ?? 0;
  return french / letters;
}

function lexicalDiversity(words: string[]) {
  if (!words.length) return 0;
  const unique = new Set(words.map((w) => normalize(w).replace(/[^\p{L}\p{N}']/gu, '')));
  return unique.size / words.length;
}

function paragraphSimilarity(a: string, b: string) {
  const wa = new Set(normalize(a).split(/\s+/).filter((w) => w.length > 3));
  const wb = new Set(normalize(b).split(/\s+/).filter((w) => w.length > 3));
  if (!wa.size || !wb.size) return 0;
  let overlap = 0;
  for (const w of wa) if (wb.has(w)) overlap += 1;
  return overlap / Math.max(wa.size, wb.size);
}

function detectRepetition(submission: string) {
  const paragraphs = submission
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length < 2) {
    const chunks = submission.split(/(?<=[.!?…])\s+/).filter((s) => s.trim().length > 20);
    if (chunks.length >= 4) {
      const mid = Math.floor(chunks.length / 2);
      const first = chunks.slice(0, mid).join(' ');
      const second = chunks.slice(mid).join(' ');
      const sim = paragraphSimilarity(first, second);
      return { ratio: sim, duplicateParagraphs: sim > 0.68 ? 1 : 0 };
    }
    const half = Math.floor(submission.length / 2);
    if (half > 40) {
      const sim = paragraphSimilarity(submission.slice(0, half), submission.slice(half));
      return { ratio: sim, duplicateParagraphs: sim > 0.68 ? 1 : 0 };
    }
    return { ratio: 0, duplicateParagraphs: 0 };
  }

  let dupes = 0;
  for (let i = 0; i < paragraphs.length; i++) {
    for (let j = i + 1; j < paragraphs.length; j++) {
      if (paragraphSimilarity(paragraphs[i], paragraphs[j]) > 0.68) dupes += 1;
    }
  }
  return { ratio: dupes / Math.max(paragraphs.length - 1, 1), duplicateParagraphs: dupes };
}

function detectLetterStructure(submission: string) {
  const norm = normalize(submission);
  const hasOpen = countMatches(submission, FORMAL_OPENERS) > 0 || norm.startsWith('madame') || norm.startsWith('monsieur');
  const hasClose = countMatches(submission, FORMAL_CLOSINGS) > 0;
  const hasRequest = countMatches(submission, REQUEST_MARKERS) > 0;
  const sentences = submission.split(/[.!?…]+/).filter((s) => s.trim().length > 8);
  return { hasOpen, hasClose, hasRequest, sentenceCount: sentences.length };
}

function runGrammarChecks(submission: string) {
  const hits: string[] = [];
  let penalty = 0;

  for (const { pattern, weight, message } of GRAMMAR_PATTERNS) {
    const matches = submission.match(pattern);
    if (matches?.length) {
      penalty += Math.min(weight, matches.length * (weight * 0.6));
      if (!hits.includes(message)) hits.push(message);
    }
  }

  const adjacentRepeat = submission.match(/\b(\w{3,})\s+\1\b/gi);
  if (adjacentRepeat?.length) {
    penalty += Math.min(14, adjacentRepeat.length * 5);
    hits.push('Avoid repeating the same word back-to-back.');
  }

  const articleDup = submission.match(/\b(le|la|les|de|du|des|un|une)\s+\1\b/gi);
  if (articleDup?.length) {
    penalty += Math.min(10, articleDup.length * 4);
    hits.push('Remove duplicated articles or prepositions.');
  }

  const anglicisms = countMatches(submission, ANGLICISM_MARKERS);
  if (anglicisms > 0) {
    penalty += anglicisms * 5;
    hits.push('Replace English words with French equivalents.');
  }

  if (frenchTextRatio(submission) < 0.88 && countWords(submission) > 30) {
    penalty += 15;
    hits.push('Most of the response should be written in French.');
  }

  return { penalty, hits };
}

function scoreLanguageAccuracy(submission: string, level: string) {
  let score = 88;
  const { penalty, hits } = runGrammarChecks(submission);
  score -= penalty;

  const sentences = submission.split(/(?<=[.!?…])\s+/).filter((s) => s.trim().length > 4);
  const badStarts = sentences.filter((s) => /^[a-zàâäéèêëïîôùûü]/.test(s.trim())).length;
  if (badStarts > 0) score -= Math.min(8, badStarts * 2);

  const frenchChars = submission.match(/[àâäéèêëïîôùûüç]/gi)?.length ?? 0;
  const wordCount = countWords(submission);
  if (wordCount > 50 && frenchChars < wordCount * 0.025) score -= 10;

  const nePas = (submission.match(/\bne\s+\w+\s+pas\b/gi) ?? []).length;
  const bareNeg = (submission.match(/\bpas\s+\w+/gi) ?? []).length;
  if (bareNeg > nePas + 2 && wordCount > 40) score -= 6;

  const complexity = countMatches(submission, COMPLEXITY_MARKERS);
  if (['B2', 'C1', 'C2'].includes(level) && complexity >= 2) score += 4;
  if (['B2', 'C1', 'C2'].includes(level) && complexity === 0 && wordCount > 120) score -= 5;

  const exclamations = (submission.match(/!/g) ?? []).length;
  if (exclamations > 3 && level >= 'B1') score -= 5;

  const feedback =
    hits.length > 0
      ? hits.slice(0, 2).join(' ')
      : complexity >= 2
        ? 'Solid grammatical control with varied sentence structures.'
        : 'No major surface errors — double-check agreement and verb tenses.';

  return { score: clamp(score), feedback, issues: hits };
}

function scoreVocabulary(submission: string, level: string, promptKeywords: string[]) {
  const words = submission.trim().split(/\s+/).filter(Boolean);
  const diversity = lexicalDiversity(words);
  const minDiv = LEVEL_MIN_DIVERSITY[level] ?? LEVEL_MIN_DIVERSITY.B1;

  const connectors = CONNECTORS_BY_LEVEL[level] ?? CONNECTORS_BY_LEVEL.B1;
  const connectorHits = countMatches(submission, connectors);
  const minConnectors = LEVEL_MIN_CONNECTORS[level] ?? 2;
  const advancedHits = countMatches(submission, ADVANCED_VOCAB_MARKERS);
  const complexityHits = countMatches(submission, COMPLEXITY_MARKERS);

  const submissionNorm = normalize(submission);
  const topicHits = promptKeywords.filter((k) => submissionNorm.includes(k)).length;
  const topicRatio = promptKeywords.length ? topicHits / promptKeywords.length : 0;

  let score = 48;
  score += Math.min(24, Math.round((diversity / minDiv) * 20));
  score += Math.min(16, connectorHits * 4);
  score += Math.min(10, advancedHits * 3);
  score += Math.min(8, complexityHits * 2);
  score += Math.min(10, Math.round(topicRatio * 10));

  if (connectorHits < minConnectors) score -= (minConnectors - connectorHits) * 5;
  if (diversity < minDiv - 0.08) score -= 8;

  const longWords = words.filter((w) => w.replace(/[^\p{L}]/gu, '').length >= 7).length;
  const longRatio = longWords / Math.max(words.length, 1);
  if (['B2', 'C1', 'C2'].includes(level) && longRatio >= 0.07) score += 5;
  if (['A1', 'A2'].includes(level) && longRatio > 0.22) score -= 6;

  let feedback: string;
  if (topicRatio >= 0.4 && connectorHits >= minConnectors) {
    feedback = `Topic vocabulary is on point (${topicHits}/${promptKeywords.length} themes). Connectors and range suit ${level}.`;
  } else if (connectorHits < minConnectors) {
    feedback = `Add linking words (${connectors.slice(0, 3).join(', ')}…) and reuse key terms from the prompt.`;
  } else {
    feedback = `Broaden vocabulary — use precise words related to the task and more varied connectors for ${level}.`;
  }

  return { score: clamp(score), feedback, diversity, connectorHits };
}

function scoreContentCoherence(
  submission: string,
  level: string,
  section: string | null,
  taskType: string
) {
  const paragraphs = submission.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  const sentences = submission.split(/[.!?…]+/).filter((s) => s.trim().length > 4);
  const repetition = detectRepetition(submission);
  const discourseHits = countMatches(submission, DISCOURSE_MARKERS);
  const opinionHits = countMatches(submission, OPINION_MARKERS);
  const letter = detectLetterStructure(submission);

  let score = 52;
  score += Math.min(14, paragraphs.length >= 3 ? 14 : paragraphs.length >= 2 ? 10 : paragraphs.length * 4);
  score += Math.min(12, sentences.length >= 5 ? 12 : sentences.length >= 3 ? 8 : sentences.length * 2);
  score += Math.min(8, discourseHits * 3);
  score += Math.min(8, countMatches(submission, COMPLEXITY_MARKERS) * 2);

  if (section === 'B') {
    score += Math.min(8, opinionHits * 4);
    if (paragraphs.length < 3 && sentences.length < 6) score -= 8;
    if (opinionHits === 0) score -= 6;
  }

  if (taskType === 'letter' || taskType === 'email') {
    if (letter.hasOpen && letter.hasClose) score += 10;
    else if (letter.hasOpen || letter.hasClose) score += 4;
    else score -= 8;
    if (letter.hasRequest) score += 6;
  }

  if (repetition.duplicateParagraphs > 0) {
    score -= Math.min(40, 22 + repetition.duplicateParagraphs * 10);
  }

  let feedback: string;
  if (repetition.duplicateParagraphs > 0) {
    feedback = 'Repeated or copied blocks hurt coherence — each paragraph should add a new idea.';
  } else if (section === 'B' && opinionHits >= 1 && paragraphs.length >= 3) {
    feedback = `Well-structured argument with ${paragraphs.length} paragraphs and clear opinion markers.`;
  } else if (letter.hasOpen && letter.hasClose && letter.hasRequest) {
    feedback = 'Letter follows a clear opening → request → closing structure.';
  } else if (sentences.length >= 4) {
    feedback = `${sentences.length} sentences with ${paragraphs.length || 1} block(s) — add clearer paragraph breaks if needed.`;
  } else {
    feedback = 'Develop ideas across several sentences and separate introduction, body, and conclusion.';
  }

  return { score: clamp(score), feedback };
}

function scoreTaskFulfillment(
  submission: string,
  prompt: Record<string, unknown>,
  level: string,
  compliance: ReturnType<typeof assessWordCountCompliance>
) {
  const taskType = String(prompt.taskType ?? prompt.taskMode ?? 'essay');
  const register = String(prompt.register ?? 'formel');
  const section = inferTefWritingSection(prompt);

  const rubricHints = Array.isArray(prompt.rubricHints)
    ? (prompt.rubricHints as string[]).map(String)
    : [];
  const promptKeywords = [
    ...extractKeywords(`${prompt.title ?? ''} ${prompt.instructions ?? ''} ${prompt.prompt ?? ''}`),
    ...extractKeywords(rubricHints.join(' '), 6),
  ];
  const uniqueKeywords = [...new Set(promptKeywords)];

  const submissionNorm = normalize(submission);
  const keywordHits = uniqueKeywords.filter((k) => submissionNorm.includes(k)).length;
  const keywordRatio = uniqueKeywords.length ? keywordHits / uniqueKeywords.length : 0.5;

  let score = 44;
  score += Math.min(26, Math.round(keywordRatio * 26));

  const markers = TASK_TYPE_MARKERS[taskType] ?? TASK_TYPE_MARKERS.essay;
  score += Math.min(14, countMatches(submission, markers.required) * 4 + countMatches(submission, markers.optional) * 2);

  if (register === 'formel' || section === 'B') {
    const formalOpen = countMatches(submission, FORMAL_OPENERS);
    const formalClose = countMatches(submission, FORMAL_CLOSINGS);
    score += Math.min(12, formalOpen * 4 + formalClose * 4);
    if (!formalOpen && !formalClose) score -= 10;
  }

  if (taskType === 'letter' && countMatches(submission, REQUEST_MARKERS) > 0) score += 8;
  if (section === 'B' && countMatches(submission, OPINION_MARKERS) > 0) score += 6;

  if (!compliance.compliant) score -= 14;

  let feedback: string;
  if (keywordRatio >= 0.45) {
    feedback = `Addresses the prompt well (${keywordHits}/${uniqueKeywords.length} key themes covered).`;
  } else if (keywordRatio >= 0.25) {
    feedback = `Partially on topic — include more details from the situation (${keywordHits}/${uniqueKeywords.length} themes).`;
  } else {
    feedback = 'Off-topic or too vague — re-read the prompt and answer every part of the task.';
  }

  return { score: clamp(score), feedback };
}

function buildSuggestions(
  criteria: { criterion: string; score: number }[],
  level: string,
  section: string | null,
  accuracyIssues: string[]
) {
  const weak = [...criteria].sort((a, b) => a.score - b.score).slice(0, 2);
  const tips: string[] = [...accuracyIssues.slice(0, 1)];

  for (const row of weak) {
    if (row.criterion === 'language_accuracy' && !tips.length) {
      tips.push('Re-read for agreement, verb tenses, and accents.');
    }
    if (row.criterion === 'vocabulary') {
      const connectors = (CONNECTORS_BY_LEVEL[level] ?? CONNECTORS_BY_LEVEL.B1).slice(0, 3);
      tips.push(`Use linking words such as ${connectors.join(', ')}.`);
    }
    if (row.criterion === 'content_coherence') {
      tips.push(
        section === 'B'
          ? 'Structure: thesis → arguments with examples → conclusion with “en conclusion”.'
          : 'Use separate paragraphs for greeting, main message, and closing.'
      );
    }
    if (row.criterion === 'task_fulfillment') {
      tips.push('Answer every bullet in the prompt and match the required register (formal/neutral).');
    }
  }

  if (tips.length < 3) tips.push('Read your text aloud once — errors are easier to hear.');
  if (tips.length < 4 && section === 'B') tips.push('Support your opinion with one concrete example.');
  return [...new Set(tips)].slice(0, 5);
}

function buildSummary(
  criteria: { label: string; score: number }[],
  wordCount: number,
  compliance: ReturnType<typeof assessWordCountCompliance>,
  requirements: { minWords: number; maxWords: number }
) {
  const sorted = [...criteria].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const weak = sorted[sorted.length - 1];

  if (!compliance.compliant) {
    return `Word count (${wordCount}) is outside ${requirements.minWords}–${requirements.maxWords}. Strongest: ${best.label} (${best.score}/100). Focus next on ${weak.label}.`;
  }

  return `Score based on TEF criteria (${wordCount} words in range). Strongest: ${best.label} (${best.score}/100). Improve: ${weak.label} (${weak.score}/100).`;
}

/**
 * Template rubric evaluation — primary path for full writing tasks.
 */
export function evaluateWritingWithRubric(
  submission: string,
  wordCount: number,
  prompt: Record<string, unknown>,
  level: string
) {
  const requirements = resolveWordCountRequirements(prompt, level);
  const compliance = assessWordCountCompliance(
    wordCount,
    requirements.minWords,
    requirements.maxWords
  );
  const section = inferTefWritingSection(prompt);
  const taskType = String(prompt.taskType ?? prompt.taskMode ?? 'essay');
  const lengthNote = wordCountFeedback(
    compliance,
    wordCount,
    requirements.minWords,
    requirements.maxWords
  );

  const promptKeywords = extractKeywords(
    `${prompt.title ?? ''} ${prompt.instructions ?? ''} ${prompt.prompt ?? ''}`
  );

  const task = scoreTaskFulfillment(submission, prompt, level, compliance);
  const coherence = scoreContentCoherence(submission, level, section, taskType);
  const vocabulary = scoreVocabulary(submission, level, promptKeywords);
  const accuracy = scoreLanguageAccuracy(submission, level);

  const criteria = buildCriteria({
    task_fulfillment: {
      score: task.score,
      feedback: `${task.feedback} ${lengthNote}`,
    },
    content_coherence: coherence,
    vocabulary,
    language_accuracy: accuracy,
  });

  const weighted =
    coherence.score * 0.2 +
    vocabulary.score * 0.2 +
    accuracy.score * 0.3 +
    task.score * 0.3;

  const draft = {
    criteria,
    overallScore: clamp(weighted),
    summary: buildSummary(criteria, wordCount, compliance, requirements),
    suggestions: buildSuggestions(criteria, level, section, accuracy.issues ?? []),
    evaluationMethod: 'rubric',
  };

  return applyWordCountToEvaluation(draft, wordCount, prompt, level);
}
