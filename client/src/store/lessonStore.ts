import { create } from 'zustand';
import type { TefDiagnostic } from '@/modules/tef/types/tef';

export type LessonMode = 'placement' | 'practice';

type LessonState = {
  mode: LessonMode | null;
  topic: string | null;
  lastDiagnostic: TefDiagnostic | null;
  setMode: (mode: LessonMode, topic?: string | null) => void;
  setLastDiagnostic: (diagnostic: TefDiagnostic) => void;
  reset: () => void;
};

export const useLessonStore = create<LessonState>((set) => ({
  mode: null,
  topic: null,
  lastDiagnostic: null,
  setMode: (mode, topic = null) => set({ mode, topic }),
  setLastDiagnostic: (lastDiagnostic) => set({ lastDiagnostic }),
  reset: () => set({ mode: null, topic: null, lastDiagnostic: null }),
}));
