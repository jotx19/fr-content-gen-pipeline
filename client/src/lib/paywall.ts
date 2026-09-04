import { usePaywallStore, type PaywallFeature } from '@/store/paywallStore';
import { isBillingPro, type BillingLike } from '@/lib/billing-plan';

export function handlePaywallError(error: unknown, fallback: PaywallFeature = 'reading') {
  const err = error as Error & { paywall?: boolean; feature?: PaywallFeature };
  if (err?.paywall) {
    usePaywallStore.getState().openPaywall(err.feature ?? fallback);
    return true;
  }
  return false;
}

type BillingUsageLike = BillingLike & {
  limits: {
    readingSessionsPerDay: number | null;
    writingSessionsPerDay: number | null;
    notesMax?: number | null;
    translationsMax?: number | null;
  };
  usage: {
    readingSessions: number;
    writingSessions: number;
    notesCount?: number;
    translationsTotal?: number;
  };
};

export function isAtDailyLimit(billing: BillingUsageLike | undefined, feature: PaywallFeature) {
  if (!billing || isBillingPro(billing)) return false;

  if (feature === 'notes') {
    const limit = billing.limits.notesMax;
    const used = billing.usage.notesCount ?? 0;
    if (limit == null) return false;
    return used >= limit;
  }

  if (feature === 'translate') {
    const limit = billing.limits.translationsMax;
    const used = billing.usage.translationsTotal ?? 0;
    if (limit == null) return false;
    return used >= limit;
  }

  const limit =
    feature === 'reading'
      ? billing.limits.readingSessionsPerDay
      : billing.limits.writingSessionsPerDay;
  const used =
    feature === 'reading' ? billing.usage.readingSessions : billing.usage.writingSessions;
  if (limit == null) return false;
  return used >= limit;
}

export function remainingQuota(
  billing: BillingUsageLike | undefined,
  feature: 'notes' | 'translate',
): { used: number; limit: number | null; remaining: number | null } {
  if (!billing || isBillingPro(billing)) {
    return { used: 0, limit: null, remaining: null };
  }
  if (feature === 'notes') {
    const limit = billing.limits.notesMax ?? null;
    const used = billing.usage.notesCount ?? 0;
    return { used, limit, remaining: limit == null ? null : Math.max(0, limit - used) };
  }
  const limit = billing.limits.translationsMax ?? null;
  const used = billing.usage.translationsTotal ?? 0;
  return { used, limit, remaining: limit == null ? null : Math.max(0, limit - used) };
}
