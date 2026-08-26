import { axiosInstance } from '@/lib/axios';

export type BillingInterval = 'month' | 'year';

export type BillingPrices = {
  monthly: { amount: number; currency: string; interval: 'month' };
  yearly: { amount: number; currency: string; interval: 'year'; savePercent: number };
};

export type BillingPricesResponse = {
  prices: BillingPrices;
  limits: {
    readingSessionsPerDay: number;
    writingSessionsPerDay: number;
  };
};

export type BillingStatus = {
  plan: 'free' | 'pro';
  subscriptionStatus: string;
  subscriptionInterval: BillingInterval | null;
  currentPeriodEnd: string | null;
  billingConfigured: boolean;
  limits: {
    readingSessionsPerDay: number | null;
    writingSessionsPerDay: number | null;
  };
  usage: {
    date: string;
    readingSessions: number;
    writingSessions: number;
  };
  prices: BillingPrices;
};

export async function fetchBillingPrices() {
  const { data } = await axiosInstance.get<BillingPricesResponse>('/billing/prices');
  return data;
}

export async function fetchBillingStatus() {
  const { data } = await axiosInstance.get<BillingStatus>('/billing/status');
  return data;
}

export async function startCheckout(interval: BillingInterval) {
  const { data } = await axiosInstance.post<{ url: string | null; sessionId?: string }>(
    '/billing/checkout',
    { interval }
  );
  return data;
}

export async function openBillingPortal() {
  const { data } = await axiosInstance.post<{ url: string }>('/billing/portal');
  return data;
}
