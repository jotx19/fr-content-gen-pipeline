/**
 * LLM subagents — organized by module.
 *
 * shared/   — client + reading MCQ schemas/normalizers
 * reading/  — reading.placement, reading.mcqGenerator, reading.evaluator, reading.levelEstimator
 * writing/  — writing.prompt, writing.evaluator, writing.example, writing.schemas
 *
 * Register new subagents in agent/subagent_registry.ts
 */

export { callStructuredSubagent } from './shared/client.js';
export * from './shared/reading.schemas.js';
export * from './shared/reading.normalize.js';
export * from './writing/writing.schemas.js';
