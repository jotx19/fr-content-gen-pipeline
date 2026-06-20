import type { Subagent } from './subagent.js';
import placement from '../subagents/placement.js';
import mcqGenerator from '../subagents/mcqGenerator.js';
import evaluator from '../subagents/evaluator.js';
import levelEstimator from '../subagents/levelEstimator.js';

const BUILTIN: Subagent[] = [placement, mcqGenerator, evaluator, levelEstimator];

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
