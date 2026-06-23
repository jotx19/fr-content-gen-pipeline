import axios from 'axios';
import { axiosInstance } from '@/lib/axios';
import type {
  CheckAnswerResponse,
  OnboardStartResponse,
  PracticeBatch,
  TefDiagnostic,
  TefProfile,
} from '../types/tef';

export async function fetchTefProfile() {
  try {
    const { data } = await axiosInstance.get<TefProfile>('/tef/profile');
    return data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    throw err;
  }
}

export async function startOnboard() {
  const { data } = await axiosInstance.post<OnboardStartResponse>('/tef/onboard/start', {});
  return data;
}

export async function submitOnboard(userAnswers: number[]) {
  const { data } = await axiosInstance.post<TefDiagnostic>('/tef/onboard/submit', { userAnswers });
  return data;
}

export async function fetchPractice() {
  const { data } = await axiosInstance.get<PracticeBatch>('/tef/practice');
  return data;
}

export async function submitPractice(userAnswers: number[]) {
  const { data } = await axiosInstance.post<TefDiagnostic>('/tef/practice/submit', { userAnswers });
  return data;
}

export async function prefetchPractice() {
  await axiosInstance.post('/tef/practice/prefetch', {}).catch(() => {});
}

export async function checkAnswer(payload: {
  kind: 'placement' | 'practice';
  questionIndex: number;
  userAnswer: number;
}) {
  const { data } = await axiosInstance.post<CheckAnswerResponse>('/tef/check-answer', payload);
  return data;
}
