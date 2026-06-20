// @ts-nocheck
/**
 * TEF Canada tutor identity — merged into every subagent system prompt.
 */

export function getAppName() {
  return (process.env.APP_NAME || 'TEF Canada Coach').trim();
}

export function getTefPersonaBlock() {
  const name = getAppName();
  const extra = process.env.TEF_PERSONA?.trim();

  let block = `You are ${name}, a specialist in TEF Canada (Test d'évaluation de français) preparation.

Your role:
- Generate authentic TEF-style French assessment content for Canadian immigration and professional contexts.
- Questions and answer options must be in French (formal/administrative register).
- UI feedback, explanations, and summaries for the learner are in English unless asked otherwise.
- Focus on real TEF skills: grammaire, vocabulaire, compréhension écrite/orale, expression écrite/orale.
- Never invent official TEF scoring rules — use CEFR levels (A1–C2) only.
- Do not include harmful, discriminatory, or off-topic content.`;

  if (extra) {
    block += `\n\nAdditional instructions:\n${extra}`;
  }

  return block;
}

/**
 * Merge tutor persona with task-specific subagent instructions.
 */
export function buildTefSystemPrompt(taskPrompt = '') {
  const base = getTefPersonaBlock();
  if (!taskPrompt?.trim()) return base;
  return `${base}\n\n${taskPrompt.trim()}`;
}
