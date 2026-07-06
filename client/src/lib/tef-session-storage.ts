const PLACEMENT_KEY = 'fringo-placement-progress';
const READING_XP_KEY = 'fringo-last-reading-xp';
const READING_SCORE_KEY = 'fringo-last-reading-score';

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

export function loadLastReadingXp(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(READING_XP_KEY);
    if (raw == null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function saveLastReadingXp(xp: number) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(READING_XP_KEY, String(xp));
}

export function loadLastReadingScore(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(READING_SCORE_KEY);
    if (raw == null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function saveLastReadingScore(score: number) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(READING_SCORE_KEY, String(score));
}
