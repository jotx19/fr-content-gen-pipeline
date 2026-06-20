// @ts-nocheck
import { callStructuredSubagent } from './client';
import { evaluatorOutputSchema } from './schemas';

const EVALUATOR_SYSTEM = `You enrich TEF Canada MCQ results with short English explanations.

Input: questions (with correctIndex), userAnswers, and local scoring results.
For each WRONG answer only, write a concise English explanation (1–2 sentences) referencing the correct option.
Do not change scores or correctIndex. Keep skillTag from input.

Output JSON only:
{"results":[{"questionIndex":0,"correct":false,"skillTag":"grammaire","explanation":"..."}]}`;

export default {
  name: 'evaluator',
  description:
    'Enrich wrong-answer explanations after local scoring. Input: { questions, userAnswers, results }',
  async run(input) {
    const payload = typeof input === 'string' ? JSON.parse(input) : input ?? {};
    const { questions, userAnswers, results } = payload;

    if (!questions?.length || !results?.length) {
      throw new Error('evaluator requires questions and results');
    }

    const wrongOnly = results.filter((r) => !r.correct);
    if (!wrongOnly.length) {
      return { results: [] };
    }

    return callStructuredSubagent({
      systemPrompt: EVALUATOR_SYSTEM,
      userPayload: {
        questions: questions.map((q, i) => ({
          index: i,
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          skillTag: q.skillTag,
          userAnswer: userAnswers?.[i],
        })),
        wrongIndices: wrongOnly.map((r) => r.questionIndex),
      },
      schema: evaluatorOutputSchema,
      guardrailsKind: 'evaluator',
      maxAttempts: 1,
    });
  },
};
