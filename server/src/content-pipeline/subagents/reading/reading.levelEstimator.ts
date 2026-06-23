// @ts-nocheck
import { CEFR_LEVELS } from '../shared/reading.schemas.js';

const LEVEL_ORDER = CEFR_LEVELS;

/** Accuracy over last N batches required to level up (default: 2 batches, >80%). */
const LEVEL_UP_BATCHES = 2;
const LEVEL_UP_THRESHOLD = 0.8;

/** Accuracy over last batch to level down (default: <50%). */
const LEVEL_DOWN_THRESHOLD = 0.5;

function levelIndex(level) {
  const idx = LEVEL_ORDER.indexOf(level);
  return idx >= 0 ? idx : 2; // default B1
}

/**
 * Given accuracy history and current CEFR level, return adjustment direction.
 * Pure function — no LLM call.
 */
export function estimateLevel(input) {
  const payload = typeof input === 'string' ? JSON.parse(input) : input ?? {};

  const { currentLevel, accuracyHistory = [] } = payload;

  if (!currentLevel || !LEVEL_ORDER.includes(currentLevel)) {
    throw new Error(`Invalid currentLevel: ${currentLevel}. Expected one of ${LEVEL_ORDER.join(', ')}`);
  }

  const idx = levelIndex(currentLevel);
  const history = accuracyHistory.filter((n) => typeof n === 'number' && n >= 0 && n <= 1);

  if (history.length === 0) {
    return { adjustment: 'same', newLevel: currentLevel, reason: 'No accuracy history yet' };
  }

  const lastBatch = history[history.length - 1];
  const recentForUp = history.slice(-LEVEL_UP_BATCHES);

  if (
    recentForUp.length >= LEVEL_UP_BATCHES &&
    recentForUp.every((a) => a >= LEVEL_UP_THRESHOLD) &&
    idx < LEVEL_ORDER.length - 1
  ) {
    return {
      adjustment: 'levelUp',
      newLevel: LEVEL_ORDER[idx + 1],
      reason: `Accuracy ≥ ${LEVEL_UP_THRESHOLD * 100}% over last ${LEVEL_UP_BATCHES} batches`,
    };
  }

  if (lastBatch < LEVEL_DOWN_THRESHOLD && idx > 0) {
    return {
      adjustment: 'levelDown',
      newLevel: LEVEL_ORDER[idx - 1],
      reason: `Last batch accuracy ${(lastBatch * 100).toFixed(0)}% < ${LEVEL_DOWN_THRESHOLD * 100}%`,
    };
  }

  return {
    adjustment: 'same',
    newLevel: currentLevel,
    reason: 'Thresholds not met for level change',
  };
}

export default {
  name: 'levelEstimator',
  description:
    'Rule-based CEFR level adjustment. Input: { currentLevel, accuracyHistory: number[] }',
  async run(input) {
    return estimateLevel(input);
  },
};
