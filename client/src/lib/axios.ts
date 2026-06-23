import axios from 'axios';

export const API_PREFIX = '/api';

/** Direct API origin — avoids Next.js dev rewrite proxy timeouts on long LLM requests (30s+). */
function resolveApiBaseUrl() {
  const direct =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : '');
  return direct ? `${direct}${API_PREFIX}` : API_PREFIX;
}

export const axiosInstance = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
  timeout: 120_000,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.message ||
      `Request failed (${error.response?.status ?? 'network'})`;
    if (error.response?.status === 401) {
      return Promise.reject(new Error('Session expired — please sign in again'));
    }
    return Promise.reject(new Error(message));
  }
);
