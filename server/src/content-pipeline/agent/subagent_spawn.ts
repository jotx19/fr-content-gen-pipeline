import type { SubagentInput, SpawnResult } from './subagent.js';
import { getSubagent, loadSubagents } from './subagent_registry.js';

/**
 * Spawn a registered subagent — logs timing and wraps errors.
 * Inspired by openclaw subagent_spawn: single entry for all specialist calls.
 */
export async function spawnSubagent(name: string, input: SubagentInput): Promise<SpawnResult> {
  loadSubagents();
  const subagent = getSubagent(name);
  if (!subagent) throw new Error(`Unknown subagent: ${name}`);

  const started = Date.now();
  console.log(`[spawn] → ${name}`);

  try {
    const result = await subagent.run(input);
    const durationMs = Date.now() - started;
    console.log(`[spawn] ✓ ${name} (${durationMs}ms)`);
    return { subagent: name, result, durationMs };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[spawn] ✗ ${name}: ${message}`);
    throw new Error(`Subagent "${name}" failed: ${message}`);
  }
}

/** Alias for orchestrator compatibility */
export async function executeSubagent(name: string, input: SubagentInput) {
  const { subagent, result } = await spawnSubagent(name, input);
  return { subagent, result };
}
