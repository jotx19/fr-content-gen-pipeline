import { buildAgentContext } from './context.js';
import { spawnSubagent } from './subagent_spawn.js';
import { scoreMcqBatch } from '../core/tefScore.js';

export type PipelineStep =
  | 'enrich_context'
  | 'spawn_generator'
  | 'score_local'
  | 'spawn_evaluator'
  | 'spawn_level_estimator'
  | 'index_memory';

export type GraphRunOptions = {
  userId: string;
  action: 'placement' | 'practice';
  level?: string;
  weakAreas?: string[];
  topic?: string;
  count?: number;
  subagentName: 'placement' | 'mcqGenerator';
  subagentInput?: Record<string, unknown>;
};

/**
 * Content generation pipeline: intent → RAG/web → subagent spawn.
 */
export async function runGenerationGraph(opts: GraphRunOptions) {
  const steps: PipelineStep[] = ['enrich_context', 'spawn_generator'];
  console.log(`[graph] start ${opts.action} → ${steps.join(' → ')}`);

  const genCtx = await buildAgentContext({
    userId: opts.userId,
    action: opts.action,
    level: opts.level,
    weakAreas: opts.weakAreas,
    topic: opts.topic,
  });

  const { result } = await spawnSubagent(opts.subagentName, {
    ...opts.subagentInput,
    contextBlock: genCtx.contextBlock,
  });

  return { questions: result.questions ?? [], context: genCtx, topic: opts.topic };
}

export type EvaluationGraphOptions = {
  userId: string;
  kind: 'placement' | 'practice';
  questions: unknown[];
  userAnswers: number[];
  useEvaluator?: boolean;
  currentLevel?: string;
  accuracyHistory?: number[];
};

/**
 * Evaluation pipeline: local score → optional LLM evaluator → level adjust → RAG index.
 */
export async function runEvaluationGraph(opts: EvaluationGraphOptions) {
  const steps: PipelineStep[] = ['score_local'];
  if (opts.useEvaluator) steps.push('spawn_evaluator');
  if (opts.kind === 'practice') steps.push('spawn_level_estimator');
  steps.push('index_memory');
  console.log(`[graph] evaluate ${opts.kind} → ${steps.join(' → ')}`);

  let evaluation = scoreMcqBatch(opts.questions, opts.userAnswers);

  if (opts.useEvaluator) {
    try {
      const { result } = await spawnSubagent('evaluator', {
        questions: opts.questions,
        userAnswers: opts.userAnswers,
        results: evaluation.results,
      });
      const explanationByIndex = new Map(
        ((result.results as { questionIndex: number; explanation: string }[]) ?? []).map((r) => [
          r.questionIndex,
          r.explanation,
        ])
      );
      evaluation = {
        ...evaluation,
        results: evaluation.results.map((r) =>
          explanationByIndex.has(r.questionIndex)
            ? { ...r, explanation: explanationByIndex.get(r.questionIndex) }
            : r
        ),
      };
    } catch (err) {
      console.warn('[graph] evaluator skipped:', err instanceof Error ? err.message : err);
    }
  }

  let levelResult: Record<string, unknown> | null = null;
  if (opts.kind === 'practice' && opts.currentLevel) {
    const historyWithCurrent = [
      ...(opts.accuracyHistory ?? []),
      evaluation.overallAccuracy,
    ];
    const { result } = await spawnSubagent('levelEstimator', {
      currentLevel: opts.currentLevel,
      accuracyHistory: historyWithCurrent,
    });
    levelResult = result;
  }

  return { evaluation, levelResult };
}
