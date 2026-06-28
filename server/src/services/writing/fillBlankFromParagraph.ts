// @ts-nocheck

export type BlankTarget = {
  id: string;
  text: string;
  hint?: string;
  acceptableAnswers: string[];
};

export function buildFillBlankFromParagraph(
  fullParagraph: string,
  targets: BlankTarget[]
) {
  const paragraph = String(fullParagraph ?? '').trim();
  if (!paragraph || !targets.length) {
    return { paragraphParts: [], blanks: [] };
  }

  const ordered = targets
    .map((target) => ({
      target,
      index: paragraph.indexOf(target.text),
    }))
    .filter((row) => row.index >= 0)
    .sort((a, b) => a.index - b.index);

  const paragraphParts: Record<string, unknown>[] = [];
  const blanks: BlankTarget[] = [];
  let cursor = 0;

  for (const { target, index } of ordered) {
    if (index < cursor) continue;

    if (index > cursor) {
      paragraphParts.push({ type: 'text', value: paragraph.slice(cursor, index) });
    }

    paragraphParts.push({
      type: 'blank',
      id: target.id,
      hint: target.hint ?? '',
    });
    blanks.push({
      id: target.id,
      hint: target.hint ?? '',
      acceptableAnswers: target.acceptableAnswers?.length
        ? target.acceptableAnswers
        : [target.text],
    });

    cursor = index + target.text.length;
  }

  if (cursor < paragraph.length) {
    paragraphParts.push({ type: 'text', value: paragraph.slice(cursor) });
  }

  return { paragraphParts, blanks };
}

export function applyFullParagraphPrompt(prompt: Record<string, unknown>) {
  const fullParagraph = String(
    prompt.fullParagraph ?? prompt.paragraph ?? prompt.replyParagraph ?? ''
  ).trim();

  const targets = (prompt.blankTargets as BlankTarget[]) ?? [];
  if (!fullParagraph || !targets.length) {
    return prompt;
  }

  const { paragraphParts, blanks } = buildFillBlankFromParagraph(fullParagraph, targets);

  return {
    ...prompt,
    fullParagraph,
    paragraphParts,
    blanks,
    prompt: String(prompt.context ?? prompt.prompt ?? '').trim() || undefined,
  };
}
