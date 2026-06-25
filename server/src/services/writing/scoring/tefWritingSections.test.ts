// @ts-nocheck
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  applySectionWordLimits,
  inferTefWritingSection,
  nextTefWritingSection,
  tefWritingSectionConfig,
} from '../../../content-pipeline/subagents/writing/tefWritingSections.js';

describe('tefWritingSections', () => {
  it('maps Section A to 80–120 words', () => {
    const config = tefWritingSectionConfig('A');
    assert.equal(config.minWords, 80);
    assert.equal(config.maxWords, 120);
    assert.equal(config.examMinimum, 80);
  });

  it('maps Section B to 200–280 words', () => {
    const config = tefWritingSectionConfig('B');
    assert.equal(config.minWords, 200);
    assert.equal(config.maxWords, 280);
    assert.equal(config.examMinimum, 200);
  });

  it('alternates sections for practice', () => {
    assert.equal(nextTefWritingSection('A'), 'B');
    assert.equal(nextTefWritingSection('B'), 'A');
  });

  it('infers section from legacy prompts by minWords', () => {
    assert.equal(inferTefWritingSection({ minWords: 80, maxWords: 120 }), 'A');
    assert.equal(inferTefWritingSection({ minWords: 200, maxWords: 280 }), 'B');
    assert.equal(inferTefWritingSection({ examSection: 'B', minWords: 80 }), 'B');
  });

  it('enforces section limits on generated prompts', () => {
    const prompt = applySectionWordLimits(
      { id: 'w1', minWords: 180, maxWords: 250, taskType: 'essay' },
      'A'
    );
    assert.equal(prompt.examSection, 'A');
    assert.equal(prompt.minWords, 80);
    assert.equal(prompt.maxWords, 120);
  });
});
