// @ts-nocheck
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  adjustWritingLevelFromXp,
  taskModeForWritingLevel,
  writingLevelFromXp,
  writingXpGain,
  WRITING_XP_THRESHOLDS,
} from './writingXp.js';
import { scoreFillBlanks } from './fillBlankScore.js';

describe('writingXp', () => {
  it('maps levels to task modes', () => {
    assert.equal(taskModeForWritingLevel('A1'), 'fill_blanks');
    assert.equal(taskModeForWritingLevel('A2'), 'sentences');
    assert.equal(taskModeForWritingLevel('B1'), 'full');
    assert.equal(taskModeForWritingLevel('B2'), 'full');
    assert.equal(taskModeForWritingLevel('b2'), 'full');
  });

  it('awards small XP per session', () => {
    const gain = writingXpGain(90, 'fill_blanks');
    assert.ok(gain <= 15, `expected small gain, got ${gain}`);
    assert.ok(gain >= 2);
  });

  it('levels up writing only when XP crosses the next threshold', () => {
    const almost = WRITING_XP_THRESHOLDS.A2 - 5;
    const result = adjustWritingLevelFromXp('A1', almost, 10);
    assert.equal(result.newLevel, 'A2');
    assert.equal(result.adjustment, 'levelUp');
  });

  it('does not level up from a single strong session early on', () => {
    const result = adjustWritingLevelFromXp('A1', 0, writingXpGain(100, 'fill_blanks'));
    assert.equal(result.newLevel, 'A1');
    assert.equal(result.adjustment, 'same');
  });

  it('does not auto-demote when XP sits below a manually set level', () => {
    const result = adjustWritingLevelFromXp('B1', 50, writingXpGain(80, 'full'));
    assert.equal(result.newLevel, 'B1');
    assert.equal(result.adjustment, 'same');
  });

  it('derives level from cumulative XP', () => {
    assert.equal(writingLevelFromXp(0), 'A1');
    assert.equal(writingLevelFromXp(WRITING_XP_THRESHOLDS.A2), 'A2');
    assert.equal(writingLevelFromXp(WRITING_XP_THRESHOLDS.B1), 'B1');
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
