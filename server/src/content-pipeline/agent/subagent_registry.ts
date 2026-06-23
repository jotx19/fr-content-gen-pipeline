import type { Subagent } from './subagent.js';
import readingPlacement from '../subagents/reading/reading.placement.js';
import readingMcqGenerator from '../subagents/reading/reading.mcqGenerator.js';
import readingEvaluator from '../subagents/reading/reading.evaluator.js';
import readingLevelEstimator from '../subagents/reading/reading.levelEstimator.js';
import writingPrompt from '../subagents/writing/writing.prompt.js';
import writingEvaluator from '../subagents/writing/writing.evaluator.js';
import writingExample from '../subagents/writing/writing.example.js';

const BUILTIN: Subagent[] = [
  readingPlacement,
  readingMcqGenerator,
  readingEvaluator,
  readingLevelEstimator,
  writingPrompt,
  writingEvaluator,
  writingExample,
];

const registry = new Map<string, Subagent>();

export function registerSubagent(subagent: Subagent) {
  if (!subagent?.name || typeof subagent.run !== 'function') {
    throw new Error('Subagent must have name and run(input)');
  }
  registry.set(subagent.name, subagent);
}

export function getSubagent(name: string): Subagent | null {
  return registry.get(name) ?? null;
}

export function listSubagents() {
  return [...registry.values()].map((s) => ({
    name: s.name,
    description: s.description,
  }));
}

export function loadSubagents() {
  if (registry.size >= BUILTIN.length) return;
  registry.clear();
  for (const subagent of BUILTIN) {
    if (subagent?.name) registry.set(subagent.name, subagent);
  }
  console.log(`[subagents] loaded: ${[...registry.keys()].join(', ') || '(none)'}`);
}
