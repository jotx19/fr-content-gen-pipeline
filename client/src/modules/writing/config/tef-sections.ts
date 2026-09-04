export type TefWritingSectionKey = 'A' | 'B';

export const TEF_WRITING_SECTIONS: Record<
  TefWritingSectionKey,
  {
    label: string;
    examLabel: string;
    description: string;
    examMinimum: number;
    minWords: number;
    maxWords: number;
  }
> = {
  A: {
    label: 'Section A',
    examLabel: 'TEF Canada · Expression écrite, Section A',
    description:
      'Shorter task: continue a story, describe, react to a document, or write a brief message.',
    examMinimum: 80,
    minWords: 80,
    maxWords: 120,
  },
  B: {
    label: 'Section B',
    examLabel: 'TEF Canada · Expression écrite, Section B',
    description:
      'Longer task: express an opinion, argue a position, compare viewpoints, or comment on a topic.',
    examMinimum: 200,
    minWords: 200,
    maxWords: 280,
  },
};

export function resolveWritingSectionMeta(examSection?: string | null) {
  if (examSection === 'A' || examSection === 'B') {
    return TEF_WRITING_SECTIONS[examSection];
  }
  return null;
}

export function inferWritingSection(examSection?: string | null, minWords?: number): TefWritingSectionKey {
  if (examSection === 'A' || examSection === 'B') return examSection;
  if (typeof minWords === 'number' && minWords >= 180) return 'B';
  return 'A';
}

export function sectionMetaForPrompt(prompt: { examSection?: string; minWords?: number }) {
  const key = inferWritingSection(prompt.examSection, prompt.minWords);
  return { key, ...TEF_WRITING_SECTIONS[key] };
}
