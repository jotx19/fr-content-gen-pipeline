import { axiosInstance } from '@/lib/axios';
import type { AuthMeResponse, AuthUser } from '../types/auth';

export async function fetchAuthMe() {
  const { data } = await axiosInstance.get<AuthMeResponse>('/auth/me');
  return data;
}

export async function loginWithGoogleCredential(credential: string) {
  const { data } = await axiosInstance.post<{ ok: boolean; user: AuthUser }>('/auth/google', {
    credential,
  });
  return data.user;
}

export async function logoutRequest() {
  await axiosInstance.post('/auth/logout');
}
