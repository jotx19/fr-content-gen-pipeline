// @ts-nocheck
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  applyWordCountToEvaluation,
  assessWordCountCompliance,
  hasExplicitWordLimits,
  resolveWordCountRequirements,
} from './writingWordCount.js';
import { WORD_COUNT_BY_LEVEL } from '../../../content-pipeline/subagents/writing/writing.schemas.js';

function mockEvaluation(taskFulfillmentScore = 85) {
  return {
    criteria: [
      { criterion: 'content_coherence', label: 'Content', score: 80, feedback: 'Clear structure.' },
      { criterion: 'vocabulary', label: 'Vocabulary', score: 78, feedback: 'Good range.' },
      { criterion: 'language_accuracy', label: 'Accuracy', score: 82, feedback: 'Few errors.' },
      {
        criterion: 'task_fulfillment',
        label: 'Task Fulfillment',
        score: taskFulfillmentScore,
        feedback: 'Addresses the task.',
      },
    ],
    overallScore: 80,
    summary: 'Solid submission.',
    suggestions: ['Expand conclusion.'],
  };
}

describe('resolveWordCountRequirements', () => {
  it('uses prompt minWords/maxWords for TEF exam tasks', () => {
    const req = resolveWordCountRequirements(
      { minWords: 80, maxWords: 120, level: 'B2' },
      'B2'
    );
    assert.equal(req.source, 'prompt');
    assert.equal(req.minWords, 80);
    assert.equal(req.maxWords, 120);
  });

  it('falls back to WORD_COUNT_BY_LEVEL when limits are missing', () => {
    const req = resolveWordCountRequirements({ level: 'B2' }, 'B2');
    assert.equal(req.source, 'level_fallback');
    assert.equal(req.minWords, WORD_COUNT_BY_LEVEL.B2.min);
    assert.equal(req.maxWords, WORD_COUNT_BY_LEVEL.B2.max);
  });
});

describe('hasExplicitWordLimits', () => {
  it('detects explicit prompt limits', () => {
    assert.equal(hasExplicitWordLimits({ minWords: 80, maxWords: 120 }), true);
    assert.equal(hasExplicitWordLimits({ level: 'B2' }), false);
  });
});

describe('assessWordCountCompliance', () => {
  it('marks in-range submissions compliant', () => {
    const result = assessWordCountCompliance(100, 80, 120);
    assert.equal(result.compliant, true);
    assert.equal(result.type, 'none');
  });

  it('marks over-limit submissions non-compliant', () => {
    const result = assessWordCountCompliance(220, 80, 120);
    assert.equal(result.compliant, false);
    assert.equal(result.type, 'over');
    assert.equal(result.deviation, 100);
  });
});

describe('applyWordCountToEvaluation', () => {
  it('TEF B2 100 words in 80–120 range → no word-count penalty on task fulfillment', () => {
    const prompt = { minWords: 80, maxWords: 120, level: 'B2' };
    const before = mockEvaluation(85);
    const after = applyWordCountToEvaluation(before, 100, prompt, 'B2');

    const tf = after.criteria.find((c) => c.criterion === 'task_fulfillment');
    assert.ok(tf);
    assert.equal(tf.score, 85);
    assert.match(tf.feedback, /meets the task requirement \(80–120 words\)/);
    assert.equal(after.criteria.find((c) => c.criterion === 'vocabulary')?.score, 78);
    assert.equal(after.criteria.find((c) => c.criterion === 'language_accuracy')?.score, 82);
  });

  it('TEF B2 220 words in 80–120 range → task-fulfillment penalty only', () => {
    const prompt = { minWords: 80, maxWords: 120, level: 'B2' };
    const before = mockEvaluation(85);
    const after = applyWordCountToEvaluation(before, 220, prompt, 'B2');

    const tf = after.criteria.find((c) => c.criterion === 'task_fulfillment');
    assert.ok(tf);
    assert.ok(tf.score < 85, 'task fulfillment should be penalized');
    assert.match(tf.feedback, /exceeds the maximum of 120 words/);
    assert.equal(after.criteria.find((c) => c.criterion === 'vocabulary')?.score, 78);
    assert.equal(after.criteria.find((c) => c.criterion === 'language_accuracy')?.score, 82);
  });

  it('generic B2 prompt without explicit limits uses level fallback band', () => {
    const req = resolveWordCountRequirements({ level: 'B2' }, 'B2');
    assert.equal(req.source, 'level_fallback');
    assert.deepEqual(
      { min: req.minWords, max: req.maxWords },
      WORD_COUNT_BY_LEVEL.B2
    );
  });
});
