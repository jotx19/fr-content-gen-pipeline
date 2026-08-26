import { create } from 'zustand';

export type PaywallFeature = 'reading' | 'writing';

type PaywallState = {
  open: boolean;
  feature: PaywallFeature | null;
  openPaywall: (feature: PaywallFeature) => void;
  closePaywall: () => void;
};

export const usePaywallStore = create<PaywallState>((set) => ({
  open: false,
  feature: null,
  openPaywall: (feature) => set({ open: true, feature }),
  closePaywall: () => set({ open: false, feature: null }),
}));

export function isPaywallError(error: unknown): error is Error & { paywall?: true; feature?: PaywallFeature } {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'paywall' in error &&
      (error as { paywall?: boolean }).paywall
  );
}
