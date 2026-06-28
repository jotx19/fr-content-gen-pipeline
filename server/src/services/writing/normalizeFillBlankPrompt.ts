// @ts-nocheck
import { applyFullParagraphPrompt } from './fillBlankFromParagraph.js';

const BLANK_MARKER =
  /\{\{(\w+)\}\}|___(\d+)___|__\s*(\d+)\s*__|\[blank:(\w+)\]|\[(\d+)\]/gi;

function blankIdFromMatch(match: RegExpExecArray) {
  return match[1] || match[2] || match[3] || match[4] || match[5];
}

export function parseParagraphTemplate(text: string) {
  const parts: Record<string, unknown>[] = [];
  const blankIds: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  BLANK_MARKER.lastIndex = 0;
  while ((match = BLANK_MARKER.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    const id = String(blankIdFromMatch(match));
    parts.push({ type: 'blank', id, hint: '' });
    blankIds.push(id);
    lastIndex = BLANK_MARKER.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return { parts, blankIds };
}

function syncBlanks(prompt: Record<string, unknown>) {
  const parts = (prompt.paragraphParts as Record<string, unknown>[]) ?? [];
  const existing = new Map(
    ((prompt.blanks as { id: string; acceptableAnswers?: string[]; hint?: string }[]) ?? []).map(
      (b) => [b.id, b]
    )
  );

  const blanks = parts
    .filter((p) => p.type === 'blank')
    .map((p) => {
      const id = String(p.id);
      const prev = existing.get(id);
      return {
        id,
        hint: String(p.hint ?? prev?.hint ?? ''),
        acceptableAnswers: prev?.acceptableAnswers?.length
          ? prev.acceptableAnswers
          : ['réponse'],
      };
    });

  prompt.blanks = blanks;
  return prompt;
}

/** Ensure A1 fill-blank prompts always have empty interactive blanks + scoring metadata. */
export function ensureFillBlankPrompt(raw: Record<string, unknown>) {
  const prompt = { ...raw, taskMode: 'fill_blanks' };

  if (prompt.fullParagraph && Array.isArray(prompt.blankTargets) && prompt.blankTargets.length) {
    return syncBlanks(applyFullParagraphPrompt(prompt));
  }

  if (Array.isArray(prompt.paragraphParts) && prompt.paragraphParts.length > 0) {
    return syncBlanks(prompt);
  }

  const template = String(
    prompt.responseTemplate ?? prompt.paragraphTemplate ?? prompt.replyTemplate ?? ''
  );
  if (template.trim()) {
    const { parts, blankIds } = parseParagraphTemplate(template);
    if (parts.length > 0 && blankIds.length > 0) {
      prompt.paragraphParts = parts;
      return syncBlanks(prompt);
    }
  }

  const { parts, blankIds } = parseParagraphTemplate(String(prompt.prompt ?? ''));
  if (parts.length > 0 && blankIds.length > 1) {
    prompt.context = prompt.context ?? prompt.prompt;
    prompt.paragraphParts = parts;
    return syncBlanks(prompt);
  }

  return syncBlanks(
    applyFullParagraphPrompt({
      title: String(prompt.title ?? 'Complétez le message'),
      instructions:
        String(prompt.instructions) ||
        'Complétez les mots manquants dans le paragraphe (1 ou 2 mots par trou).',
      context: prompt.context ?? prompt.prompt,
      fullParagraph:
        "Bonjour! Merci pour votre message. Je confirme ma présence. Je peux venir samedi. J'arrive à 19 heures. Merci, Marie",
      blankTargets: [
        { id: '1', text: 'confirme', hint: 'verbe confirmer', acceptableAnswers: ['confirme', 'confirmer'] },
        { id: '2', text: 'peux', hint: 'verbe pouvoir', acceptableAnswers: ['peux', 'peut', 'pourrai'] },
        { id: '3', text: 'à', hint: 'préposition', acceptableAnswers: ['à', 'a'] },
        { id: '4', text: 'Merci', hint: 'formule de politesse', acceptableAnswers: ['merci', 'à bientôt', 'cordialement'] },
      ],
      level: 'A1',
      taskMode: 'fill_blanks',
      taskType: 'fill_blanks',
      register: 'neutre',
      minWords: 0,
      maxWords: 0,
    })
  );
}

export function exampleAnswersFromPrompt(prompt: Record<string, unknown>) {
  const blanks = (prompt.blanks as { id: string; acceptableAnswers?: string[] }[]) ?? [];
  return Object.fromEntries(
    blanks.map((b) => [b.id, String(b.acceptableAnswers?.[0] ?? '').trim()]).filter(([, v]) => v)
  );
}
