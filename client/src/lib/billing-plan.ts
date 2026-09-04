export type BillingLike = {
  plan?: 'free' | 'pro' | string;
  subscriptionStatus?: string;
  currentPeriodEnd?: string | null;
  isPro?: boolean;
  isTrial?: boolean;
  showPlanBadge?: boolean;
};

function isPeriodActive(currentPeriodEnd?: string | null) {
  if (!currentPeriodEnd) return true;
  return new Date(currentPeriodEnd) > new Date();
}

export function isBillingPro(billing: BillingLike | null | undefined): boolean {
  if (!billing) return false;
  if (billing.isPro === true) return true;
  if (billing.isTrial === true) return true;
  if (billing.showPlanBadge === false) return false;
  if (billing.plan !== 'pro') return false;
  return isPeriodActive(billing.currentPeriodEnd);
}

export function isBillingTrial(billing: BillingLike | null | undefined): boolean {
  if (!billing) return false;
  if (billing.isTrial === true) return true;
  return (
    isBillingPro(billing) &&
    billing.subscriptionStatus === 'trialing' &&
    billing.isPro !== true
  );
}

export function getPlanBadge(
  billing: BillingLike | null | undefined,
  labels: { pro: string; trial: string },
): { label: string; variant: 'pro' | 'trial' } | null {
  if (isBillingTrial(billing)) {
    return { label: labels.trial, variant: 'trial' };
  }
  if (billing?.isPro === true) {
    return { label: labels.pro, variant: 'pro' };
  }
  if (billing?.plan === 'pro' && isPeriodActive(billing.currentPeriodEnd)) {
    return { label: labels.pro, variant: 'pro' };
  }
  return null;
}

/** Learn hero — show Trial + Fringo for free users; Pro when subscribed; hide when plan expired. */
export function getLearnBentoPlanBadge(
  billing: BillingLike | null | undefined,
  labels: { pro: string; trial: string },
): { label: string; variant: 'pro' | 'trial' } | null {
  const active = getPlanBadge(billing, labels);
  if (active) return active;

  if (billing?.subscriptionStatus === 'canceled') return null;

  return { label: labels.trial, variant: 'trial' };
}
