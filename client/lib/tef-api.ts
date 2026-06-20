const API_OPTS: RequestInit = { credentials: 'include' };

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    throw new Error('Session expired — please sign in again');
  }
  if (!res.ok) {
    const err = data as { error?: string };
    throw new Error(err.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export async function tefStartOnboard() {
  const res = await fetch('/api/tef/onboard/start', {
    method: 'POST',
    ...API_OPTS,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return parseJson<{ questions: PublicQuestion[] }>(res);
}

export async function tefSubmitOnboard(userAnswers: number[]) {
  const res = await fetch('/api/tef/onboard/submit', {
    method: 'POST',
    ...API_OPTS,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userAnswers }),
  });
  return parseJson<TefDiagnostic>(res);
}

export async function tefGetPractice() {
  const res = await fetch('/api/tef/practice', API_OPTS);
  return parseJson<PracticeBatch>(res);
}

export async function tefSubmitPractice(userAnswers: number[]) {
  const res = await fetch('/api/tef/practice/submit', {
    method: 'POST',
    ...API_OPTS,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userAnswers }),
  });
  return parseJson<TefDiagnostic>(res);
}

export async function tefGetProfile() {
  const res = await fetch('/api/tef/profile', API_OPTS);
  if (res.status === 404) return null;
  return parseJson<TefProfile>(res);
}

export async function tefGetEvaluations(limit = 10) {
  const res = await fetch(`/api/tef/evaluations?limit=${limit}`, API_OPTS);
  return parseJson<{ evaluations: TefEvaluationSummary[] }>(res);
}

export async function tefPrefetchPractice() {
  await fetch('/api/tef/practice/prefetch', {
    method: 'POST',
    ...API_OPTS,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  }).catch(() => {});
}

export type PublicQuestion = {
  id?: string;
  question: string;
  options: string[];
  skillTag?: string;
};

export type TefStats = {
  totalSessions: number;
  totalQuestions: number;
  streakDays: number;
  xp: number;
};

export type TefEvaluationSummary = {
  _id: string;
  kind: 'placement' | 'practice';
  overallAccuracy: number;
  levelBefore?: string | null;
  levelAfter?: string | null;
  adjustment?: string | null;
  weakAreas?: string[];
  summary?: string;
  topic?: string | null;
  createdAt: string;
};

export type TefProfile = {
  level: string;
  confidence?: number | null;
  weakAreas?: string[];
  summary?: string;
  onboardedAt?: string | null;
  practiceReady?: boolean;
  stats?: TefStats;
  lastEvaluation?: {
    id: string;
    kind: string;
    overallAccuracy: number;
    levelAfter?: string | null;
    summary?: string;
    createdAt?: string;
  } | null;
};

export type PracticeBatch = {
  level: string;
  weakAreas: string[];
  topic?: string;
  questions: PublicQuestion[];
  ready: boolean;
};

export type TefDiagnostic = {
  overallAccuracy?: number;
  skillBreakdown?: { skillTag: string; correct: number; total: number; accuracy: number }[];
  weakAreas?: string[];
  adjustment?: string;
  newLevel?: string;
  summary?: string;
  estimatedLevel?: string;
  confidence?: number;
  evaluationId?: string;
  profile?: TefProfile;
};
