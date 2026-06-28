import axios from 'axios';
import { axiosInstance } from '@/lib/axios';
import type {
  WritingExampleResponse,
  WritingProfile,
  WritingPromptResponse,
  WritingSubmitPayload,
  WritingSubmitResponse,
} from '../types/writing';

export async function fetchWritingProfile() {
  try {
    const { data } = await axiosInstance.get<WritingProfile>('/tef/writing/profile');
    return data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    throw err;
  }
}

export async function fetchWritingPrompt(params?: {
  topic?: string;
  section?: 'A' | 'B';
  refresh?: boolean;
}) {
  const search = new URLSearchParams();
  if (params?.topic) search.set('topic', params.topic);
  if (params?.section) search.set('section', params.section);
  if (params?.refresh) search.set('refresh', 'true');
  const qs = search.toString();
  const { data } = await axiosInstance.get<WritingPromptResponse>(
    `/tef/writing/prompt${qs ? `?${qs}` : ''}`
  );
  return data;
}

export async function submitWriting(payload: WritingSubmitPayload) {
  const { data } = await axiosInstance.post<WritingSubmitResponse>('/tef/writing/submit', payload);
  return data;
}

export async function fetchWritingExample() {
  const { data } = await axiosInstance.post<WritingExampleResponse>('/tef/writing/example', {});
  return data;
}
