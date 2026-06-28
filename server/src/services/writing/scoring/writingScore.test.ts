// @ts-nocheck
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  WRITING_LEVEL_UP_MIN_SCORE,
  WRITING_LEVEL_UP_SESSIONS,
  adjustWritingLevel,
} from './writingScore.js';

describe('adjustWritingLevel', () => {
  it('does not level up after a single strong submission', () => {
    const result = adjustWritingLevel('A2', [], 92);
    assert.equal(result.adjustment, 'same');
    assert.equal(result.newLevel, 'A2');
  });

  it('does not level up after two strong submissions', () => {
    const result = adjustWritingLevel('A2', [90], 91);
    assert.equal(result.adjustment, 'same');
    assert.equal(result.newLevel, 'A2');
  });

  it('does not level up when one score in the window is below the minimum', () => {
    const history = [92, 90, WRITING_LEVEL_UP_MIN_SCORE - 1];
    const result = adjustWritingLevel('B1', history, 91);
    assert.equal(result.adjustment, 'same');
    assert.equal(result.newLevel, 'B1');
  });

  it('levels up only after four consecutive strong scores', () => {
    const history = [90, 91, 92];
    const result = adjustWritingLevel('A2', history, 93);
    assert.equal(result.adjustment, 'levelUp');
    assert.equal(result.newLevel, 'B1');
  });

  it('requires every score in the window to meet the minimum threshold', () => {
    const history = [90, 91, WRITING_LEVEL_UP_MIN_SCORE - 1];
    const result = adjustWritingLevel('A2', history, 95);
    assert.equal(result.adjustment, 'same');
    assert.equal(result.newLevel, 'A2');
  });

  it('levels down after two consecutive weak scores', () => {
    const result = adjustWritingLevel('B1', [42], 40);
    assert.equal(result.adjustment, 'levelDown');
    assert.equal(result.newLevel, 'A2');
  });

  it('levels down on a single very weak submission', () => {
    const result = adjustWritingLevel('B1', [70, 68], 30);
    assert.equal(result.adjustment, 'levelDown');
    assert.equal(result.newLevel, 'A2');
  });

  it('explains how many submissions are still needed before level up', () => {
    const result = adjustWritingLevel('A2', [91], 92);
    assert.match(result.reason, new RegExp(String(WRITING_LEVEL_UP_SESSIONS - 2)));
  });
});
