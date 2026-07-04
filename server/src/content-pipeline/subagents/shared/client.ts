// @ts-nocheck
import { callLLM, getTefModelCandidates } from '../../core/llm.js';
import { buildTefSystemPrompt } from '../../core/persona.js';
import { guardMcqBatch, guardPlacementBatch } from '../../core/guardrails.js';
import { sanitizeLlmOutput, sanitizeMcqBatch } from '../../core/sanitize.js';
import { config } from '../../../config.js';

/**
 * Parse JSON from model output, tolerating fences and trailing commentary.
 */
export function parseJsonFromText(raw) {
  const trimmed = sanitizeLlmOutput(raw);
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  let jsonStr = fenced ? fenced[1].trim() : trimmed;

  try {
    return JSON.parse(jsonStr);
  } catch {
    const start = jsonStr.indexOf('{');
    const end = jsonStr.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(jsonStr.slice(start, end + 1));
    }
    throw new Error(`No JSON object found in model output`);
  }
}

function isModelUnavailableError(message) {
  const m = String(message ?? '');
  return (
    m.includes('404') ||
    m.includes('No endpoints found') ||
    m.includes('not a valid model ID')
  );
}

function runGuardrails(parsed, guardrailsKind) {
  if (!guardrailsKind || !parsed?.questions) return { ok: true };

  const guard =
    guardrailsKind === 'placement'
      ? guardPlacementBatch(parsed.questions)
      : guardMcqBatch(parsed.questions, guardrailsKind);

  if (!guard.ok) {
    const detail = guard.issues
      .map((i) => `q${i.index}: ${i.issues.join(', ')}`)
      .join('; ');
    return { ok: false, error: `Guardrails failed: ${detail}` };
  }

  return { ok: true };
}

/**
 * Call OpenRouter with TEF persona, sanitize, guardrails, and zod validation.
 */
export async function callStructuredSubagent({
  systemPrompt,
  userPayload,
  schema,
  normalize,
  guardrailsKind,
  maxAttempts = 2,
  models: modelsOverride,
  maxTokens = config.tefReadingLlmMaxTokens,
}) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const models = modelsOverride?.length ? modelsOverride : getTefModelCandidates();
  let payload = userPayload;
  let lastError = '';

  for (const model of models) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const userContent =
        typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);

      const retryNote =
        attempt > 0
          ? `\n\nYour previous JSON failed validation: ${lastError}\nFix the JSON and try again.`
          : '';

      const fullSystem = buildTefSystemPrompt(
        `${systemPrompt.trim()}${retryNote}

Respond with ONLY valid JSON matching the requested schema. No markdown fences, no commentary.`
      );

      let raw;
      try {
        raw = await callLLM([{ role: 'user', content: userContent }], fullSystem, {
          stream: false,
          model,
          skipThrottle: true,
          maxTokens,
        });
      } catch (err) {
        lastError = err.message;
        if (isModelUnavailableError(err.message)) {
          console.warn(`[tef] model unavailable: ${model} — trying next`);
          break;
        }
        throw err;
      }

      let parsed;
      try {
        parsed = parseJsonFromText(raw);
      } catch (err) {
        lastError = `parse error: ${err.message}`;
        continue;
      }

      if (parsed?.questions) {
        parsed = { ...parsed, questions: sanitizeMcqBatch(parsed.questions) };
      }

      if (normalize) parsed = normalize(parsed);

      const guard = runGuardrails(parsed, guardrailsKind);
      if (!guard.ok) {
        lastError = guard.error;
        continue;
      }

      const validated = schema.safeParse(parsed);
      if (validated.success) {
        console.log(`[tef] subagent ok (${model})`);
        return validated.data;
      }

      lastError = validated.error.message;
      payload =
        typeof userPayload === 'object' && userPayload !== null
          ? { ...userPayload, _validationError: lastError }
          : userPayload;
    }
  }

  throw new Error(
    lastError.includes('OpenRouter') || lastError.includes('404')
      ? `No working TEF model found. Set TEF_LLM_MODEL in .env (tried: ${models.join(', ')}). Last error: ${lastError}`
      : `Subagent output failed validation: ${lastError}`
  );
}
