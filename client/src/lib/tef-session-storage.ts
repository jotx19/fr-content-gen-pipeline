const PLACEMENT_KEY = 'tef-placement-progress';

export type PlacementProgress = {
  questions: { id?: string; question: string; options: string[]; skillTag?: string }[];
  answers: (number | null)[];
  currentIdx: number;
};

export function loadPlacementProgress(): Partial<PlacementProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(PLACEMENT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function savePlacementProgress(data: PlacementProgress) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PLACEMENT_KEY, JSON.stringify(data));
}

export function clearPlacementProgress() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PLACEMENT_KEY);
}
