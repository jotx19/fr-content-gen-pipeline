import axios from 'axios';

export const API_PREFIX = '/api';

export const axiosInstance = axios.create({
  baseURL: API_PREFIX,
  withCredentials: true,
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
