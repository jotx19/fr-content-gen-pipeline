// @ts-nocheck
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  adjustWritingLevelFromXp,
  taskModeForWritingLevel,
  writingLevelFromXp,
  writingXpGain,
} from './writingXp.js';
import { scoreFillBlanks } from './fillBlankScore.js';

describe('writingXp', () => {
  it('maps levels to task modes', () => {
    assert.equal(taskModeForWritingLevel('A1'), 'fill_blanks');
    assert.equal(taskModeForWritingLevel('A2'), 'sentences');
    assert.equal(taskModeForWritingLevel('B1'), 'full');
  });

  it('levels up writing from XP thresholds', () => {
    const result = adjustWritingLevelFromXp('A1', 70, writingXpGain(90, 'fill_blanks'));
    assert.equal(result.newLevel, 'A2');
    assert.equal(result.adjustment, 'levelUp');
  });

  it('derives level from cumulative XP', () => {
    assert.equal(writingLevelFromXp(0), 'A1');
    assert.equal(writingLevelFromXp(85), 'A2');
    assert.equal(writingLevelFromXp(250), 'B1');
  });
});

describe('fillBlankScore', () => {
  it('scores blank answers deterministically', () => {
    const result = scoreFillBlanks(
      [
        { id: '1', acceptableAnswers: ["m'appelle", 'me appelle'] },
        { id: '2', acceptableAnswers: ['à', 'a'] },
      ],
      { '1': "m'appelle", '2': 'à' }
    );
    assert.ok(result.overallScore >= 90);
  });
});
