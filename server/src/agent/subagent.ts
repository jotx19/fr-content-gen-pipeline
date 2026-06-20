/** Subagent contract — each specialist implements name, description, run(). */
export type SubagentInput = Record<string, unknown> | string;

export type SubagentResult = Record<string, unknown>;

export interface Subagent {
  name: string;
  description: string;
  run(input: SubagentInput): Promise<SubagentResult>;
}

export type SpawnResult = {
  subagent: string;
  result: SubagentResult;
  durationMs: number;
};
