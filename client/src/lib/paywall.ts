import { usePaywallStore, type PaywallFeature } from '@/store/paywallStore';

export function handlePaywallError(error: unknown, fallback: PaywallFeature = 'reading') {
  const err = error as Error & { paywall?: boolean; feature?: PaywallFeature };
  if (err?.paywall) {
    usePaywallStore.getState().openPaywall(err.feature ?? fallback);
    return true;
  }
  return false;
}

export function isAtDailyLimit(
  billing:
    | {
        plan: string;
        limits: { readingSessionsPerDay: number | null; writingSessionsPerDay: number | null };
        usage: { readingSessions: number; writingSessions: number };
      }
    | undefined,
  feature: PaywallFeature,
) {
  if (!billing || billing.plan === 'pro') return false;
  const limit =
    feature === 'reading'
      ? billing.limits.readingSessionsPerDay
      : billing.limits.writingSessionsPerDay;
  const used =
    feature === 'reading' ? billing.usage.readingSessions : billing.usage.writingSessions;
  if (limit == null) return false;
  return used >= limit;
}
