import { axiosInstance } from '@/lib/axios';

export type TranslateRequest = {
  text: string;
  sourceLang?: 'EN' | 'FR';
  targetLang?: 'EN' | 'FR';
};

export type TranslateResponse = {
  text: string;
  detectedSourceLanguage: string;
  sourceLang: string;
  targetLang: string;
};

export async function translateText(payload: TranslateRequest) {
  const { data } = await axiosInstance.post<TranslateResponse>('/translate', payload);
  return data;
}
