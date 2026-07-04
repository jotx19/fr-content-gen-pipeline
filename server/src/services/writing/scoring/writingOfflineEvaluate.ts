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
  const baseQuality = compliance.compliant ? 74 : Math.max(38, lengthScore - 8);

  const draft = {
    criteria: buildCriteria({
      task_fulfillment: {
        score: Math.round(compliance.compliant ? 78 : lengthScore * 0.85),
        feedback: lengthNote,
      },
      content_coherence: {
        score: hasStructure ? baseQuality + 4 : Math.max(35, baseQuality - 10),
        feedback: hasStructure
          ? 'Text shows paragraph structure appropriate for the task.'
          : 'Organize your text with clear paragraphs (introduction, development, conclusion).',
      },
      vocabulary: {
        score: baseQuality,
        feedback: 'Use topic-specific vocabulary and linking words suited to your level.',
      },
      language_accuracy: {
        score: Math.max(40, baseQuality - 2),
        feedback: 'Review agreement, verb tenses, and spelling before submitting.',
      },
    }),
    overallScore: baseQuality,
    summary: compliance.compliant
      ? `Submission meets the word-count requirement (${requirements.minWords}–${requirements.maxWords} words).`
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
