// @ts-nocheck
import { WRITING_CRITERIA } from './writingScore.js';
import {
  applyWordCountToEvaluation,
  assessWordCountCompliance,
  lengthScoreFromWordCount,
  resolveWordCountRequirements,
  wordCountFeedback,
} from './writingWordCount.js';

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

/** Lightweight content signals when the LLM evaluator is unavailable. */
function analyzeSubmissionQuality(submission: string, level: string) {
  const words = submission.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  if (wordCount === 0) {
    return { quality: 18, diversity: 0, sentenceCount: 0, repetitionRatio: 1 };
  }

  const unique = new Set(words.map((w) => w.toLowerCase().replace(/[^\p{L}\p{N}']/gu, '')));
  const diversity = unique.size / wordCount;
  const sentences = submission.split(/[.!?…]+/).filter((s) => s.trim().length > 0);
  const sentenceCount = Math.max(sentences.length, 1);

  const freq: Record<string, number> = {};
  for (const w of words) {
    const key = w.toLowerCase();
    freq[key] = (freq[key] ?? 0) + 1;
  }
  const maxFreq = Math.max(...Object.values(freq));
  const repetitionRatio = maxFreq / wordCount;

  const levelExpectations: Record<string, number> = {
    A1: 8,
    A2: 10,
    B1: 14,
    B2: 16,
    C1: 18,
    C2: 20,
  };
  const expectedSentenceLen = levelExpectations[level] ?? 14;
  const avgSentenceLen = wordCount / sentenceCount;

  let quality = 38;
  quality += Math.min(22, Math.round(diversity * 45));
  quality += sentenceCount >= 3 ? 12 : sentenceCount * 4;
  quality += submission.includes('\n') ? 6 : 0;
  quality -= repetitionRatio > 0.14 ? 14 : repetitionRatio > 0.1 ? 8 : 0;
  quality += avgSentenceLen >= expectedSentenceLen * 0.65 ? 8 : -6;

  const alphaRatio =
    (submission.match(/[\p{L}]/gu)?.length ?? 0) / Math.max(submission.length, 1);
  if (alphaRatio < 0.55) quality -= 18;

  return {
    quality: Math.max(22, Math.min(88, Math.round(quality))),
    diversity,
    sentenceCount,
    repetitionRatio,
  };
}

export function scoreSentenceSubmission(
  sentencePrompts: { id: string; prompt: string; minWords: number; maxWords: number }[],
  answers: Record<string, string>
) {
  const rows = sentencePrompts.map((row) => {
    const text = String(answers[row.id] ?? '').trim();
    const words = countWords(text);
    const filled = words > 0;
    const inRange = words >= row.minWords && words <= row.maxWords;
    let score = 25;
    if (filled && inRange) score = 92;
    else if (filled) score = 68;
    return { id: row.id, text, words, filled, inRange, score };
  });

  const filledCount = rows.filter((r) => r.filled).length;
  const inRangeCount = rows.filter((r) => r.inRange).length;
  const total = Math.max(rows.length, 1);
  const avg = Math.round(rows.reduce((acc, r) => acc + r.score, 0) / total);

  const criteria = buildCriteria({
    task_fulfillment: {
      score: Math.round((filledCount / total) * 100),
      feedback:
        filledCount === total
          ? 'All prompts were answered.'
          : `${filledCount}/${total} prompts answered — complete every sentence.`,
    },
    language_accuracy: {
      score: Math.min(100, avg + (inRangeCount === total ? 4 : 0)),
      feedback:
        inRangeCount === total
          ? 'Sentence length fits the requested range.'
          : 'Check sentence length and basic grammar for each answer.',
    },
    vocabulary: {
      score: Math.min(100, avg + 2),
      feedback: 'Use varied A2 vocabulary and connectors (parce que, mais, aussi…).',
    },
    content_coherence: {
      score: Math.min(100, avg + 3),
      feedback: 'Each answer should directly respond to its question.',
    },
  });

  const overallScore = Math.round(criteria.reduce((acc, c) => acc + c.score, 0) / criteria.length);

  return {
    criteria,
    overallScore,
    summary:
      inRangeCount === total
        ? `Strong sentence task — ${inRangeCount}/${total} sentences in the word range.`
        : `${filledCount}/${total} answered, ${inRangeCount}/${total} within word limits.`,
    suggestions:
      inRangeCount === total
        ? ['Try Section A/B full writing tasks when your writing level reaches B1.']
        : [
            'Write one complete sentence per prompt.',
            'Stay within the min/max word count shown for each line.',
            'Answer the question directly before adding extra detail.',
          ],
  };
}

export function scoreFullWritingSubmission(
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
  const lengthScore = lengthScoreFromWordCount(
    wordCount,
    requirements.minWords,
    requirements.maxWords
  );
  const lengthNote = wordCountFeedback(
    compliance,
    wordCount,
    requirements.minWords,
    requirements.maxWords
  );

  const hasStructure =
    submission.includes('\n') || countWords(submission) >= requirements.minWords * 0.6;
  const content = analyzeSubmissionQuality(submission, level);
  const baseQuality = compliance.compliant
    ? content.quality
    : Math.max(28, Math.min(content.quality, lengthScore - 6));

  const draft = {
    criteria: buildCriteria({
      task_fulfillment: {
        score: Math.round(
          compliance.compliant
            ? Math.min(100, baseQuality + 6)
            : lengthScore * 0.85
        ),
        feedback: lengthNote,
      },
      content_coherence: {
        score: hasStructure ? Math.min(100, baseQuality + 5) : Math.max(30, baseQuality - 12),
        feedback: hasStructure
          ? `Text shows ${content.sentenceCount} sentence(s) with paragraph structure appropriate for the task.`
          : 'Organize your text with clear paragraphs (introduction, development, conclusion).',
      },
      vocabulary: {
        score: Math.min(100, Math.round(baseQuality + (content.diversity > 0.55 ? 4 : -4))),
        feedback:
          content.diversity > 0.55
            ? 'Lexical variety is reasonable for an offline check — an AI review will give precise vocabulary feedback.'
            : 'Try using more varied vocabulary and linking words suited to your level.',
      },
      language_accuracy: {
        score: Math.max(35, Math.round(baseQuality - (content.repetitionRatio > 0.12 ? 8 : 2))),
        feedback:
          content.repetitionRatio > 0.12
            ? 'Repeated wording detected — review agreement, verb tenses, and spelling before submitting.'
            : 'Review agreement, verb tenses, and spelling before submitting.',
      },
    }),
    overallScore: baseQuality,
    summary: compliance.compliant
      ? `Offline review: submission meets the word-count requirement (${requirements.minWords}–${requirements.maxWords} words). Connect OpenRouter for full AI examiner feedback.`
      : `Submission ${compliance.type === 'under' ? 'below' : 'above'} the required word count.`,
    suggestions: compliance.compliant
      ? ['Add clearer transitions and a explicit conclusion for Section B tasks.']
      : [
          `Aim for ${requirements.minWords}–${requirements.maxWords} words for this task.`,
          'Plan three short paragraphs before writing.',
          'Re-read for accents and agreement.',
        ],
  };

  return applyWordCountToEvaluation(draft, wordCount, prompt, level);
}
