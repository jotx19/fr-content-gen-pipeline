import { create } from 'zustand';
import type { WritingSubmitResponse } from '@/modules/writing/types/writing';

type WritingState = {
  lastResult: WritingSubmitResponse | null;
  setLastResult: (result: WritingSubmitResponse) => void;
  reset: () => void;
};

export const useWritingStore = create<WritingState>((set) => ({
  lastResult: null,
  setLastResult: (lastResult) => set({ lastResult }),
  reset: () => set({ lastResult: null }),
}));
