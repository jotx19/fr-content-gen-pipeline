// @ts-nocheck

export const TEF_WRITING_SECTIONS = {
  A: {
    key: 'A',
    label: 'Section A',
    examLabel: 'TEF Canada · Expression écrite, Section A',
    description:
      'Shorter production: continue a story, describe a situation, react to a document, or write a brief message/email.',
    minWords: 80,
    maxWords: 120,
    examMinimum: 80,
    taskTypes: ['message', 'email', 'letter'],
    registers: ['neutre', 'formel'],
    promptGuidance: [
      'Use a short narrative hook, document excerpt, or situational setup the candidate must respond to.',
      'Tasks: continue a story, describe an event, react to an ad/notice, or write a brief message or email.',
      'Keep register neutral or semi-formal unless the scenario requires formality.',
    ],
  },
  B: {
    key: 'B',
    label: 'Section B',
    examLabel: 'TEF Canada · Expression écrite, Section B',
    description:
      'Longer production: express and defend an opinion, compare viewpoints, or comment on a social topic.',
    minWords: 200,
    maxWords: 280,
    examMinimum: 200,
    taskTypes: ['essay', 'article', 'letter'],
    registers: ['formel'],
    promptGuidance: [
      'Present a debatable topic, two viewpoints, or a document to comment on.',
      'Tasks: opinion essay, argumentative text, comparison, or formal article/letter.',
      'Use formal register (formel) and expect structured paragraphs (introduction, development, conclusion).',
    ],
  },
} as const;

export type TefWritingSectionKey = keyof typeof TEF_WRITING_SECTIONS;

export function isTefWritingSection(value: unknown): value is TefWritingSectionKey {
  return value === 'A' || value === 'B';
}

export function tefWritingSectionConfig(section: TefWritingSectionKey) {
  return TEF_WRITING_SECTIONS[section];
}

/** Alternate A ↔ B for practice variety. */
export function nextTefWritingSection(current: TefWritingSectionKey | null | undefined): TefWritingSectionKey {
  if (current === 'A') return 'B';
  if (current === 'B') return 'A';
  return Math.random() < 0.5 ? 'A' : 'B';
}

export function inferTefWritingSection(prompt: Record<string, unknown> | null | undefined): TefWritingSectionKey | null {
  if (!prompt || typeof prompt !== 'object') return null;
  if (isTefWritingSection(prompt.examSection)) return prompt.examSection;
  const min = prompt.minWords;
  if (typeof min === 'number' && min >= 180) return 'B';
  if (typeof min === 'number' && min >= 20) return 'A';
  return null;
}

export function resolveTefWritingSection(
  requested: unknown,
  fallback: TefWritingSectionKey | null | undefined
): TefWritingSectionKey {
  if (isTefWritingSection(requested)) return requested;
  return nextTefWritingSection(fallback);
}

/** Enforce official TEF word limits on generated prompts. */
export function applySectionWordLimits(
  prompt: Record<string, unknown>,
  section: TefWritingSectionKey
) {
  const config = tefWritingSectionConfig(section);
  return {
    ...prompt,
    examSection: section,
    minWords: config.minWords,
    maxWords: config.maxWords,
  };
}
