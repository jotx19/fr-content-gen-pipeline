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
  timeout: 180_000,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    if (error.response?.status === 403 && data?.code === 'PAYWALL') {
      const paywallErr = new Error(data.error || 'Upgrade required') as Error & {
        paywall: true;
        feature?: 'reading' | 'writing' | 'notes' | 'translate';
      };
      paywallErr.paywall = true;
      paywallErr.feature = data.feature;
      return Promise.reject(paywallErr);
    }
    const message =
      data?.error ||
      error.message ||
      `Request failed (${error.response?.status ?? 'network'})`;
    if (error.response?.status === 401) {
      return Promise.reject(new Error('Session expired — please sign in again'));
    }
    return Promise.reject(new Error(message));
  }
);
