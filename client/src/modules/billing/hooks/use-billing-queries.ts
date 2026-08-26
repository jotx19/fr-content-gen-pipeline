'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchBillingPrices,
  fetchBillingStatus,
  openBillingPortal,
  startCheckout,
  type BillingInterval,
} from '@/modules/billing/api/billing';

export function useBillingPricesQuery(enabled = true) {
  return useQuery({
    queryKey: ['billing', 'prices'],
    queryFn: fetchBillingPrices,
    enabled,
    staleTime: 60_000,
  });
}

export function useBillingStatusQuery(enabled = true) {
  return useQuery({
    queryKey: ['billing', 'status'],
    queryFn: fetchBillingStatus,
    enabled,
    staleTime: 30_000,
  });
}

export function useCheckoutMutation() {
  return useMutation({
    mutationFn: (interval: BillingInterval) => startCheckout(interval),
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
  });
}

export function useBillingPortalMutation() {
  return useMutation({
    mutationFn: openBillingPortal,
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
  });
}

export function useInvalidateBilling() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['billing', 'status'] });
}
