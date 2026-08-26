'use client';

import { Check, Loader2 } from '@/components/icons';
import { bricolage, inter } from '@/lib/fonts';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
  useBillingPricesQuery,
  useBillingStatusQuery,
  useCheckoutMutation,
} from '@/modules/billing/hooks/use-billing-queries';
import type { BillingInterval } from '@/modules/billing/api/billing';
import { useAuthStore } from '@/store/authStore';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

type Props = {
  className?: string;
  onSkip?: () => void;
  /** Where to send users who pick the free plan (page variant). */
  freeHref?: string;
  /** @deprecated use variant="dialog" */
  compact?: boolean;
  variant?: 'default' | 'dialog' | 'page';
};

type PlanId = 'free' | BillingInterval;

type PlanCard = {
  id: PlanId;
  label: string;
  blurb: string;
  price: number;
  period: string;
  note: string;
  badge?: string;
  variant: 'free' | 'monthly' | 'yearly';
  perks: string[];
};

type CardLayout = 'mobile' | 'desktop-fill' | 'desktop-auto';

function buildFreePerks(
  t: (key: string, vars?: Record<string, string | number>) => string,
  readingLimit: number,
  writingLimit: number,
): string[] {
  return [
    t('paywall.featPlacement'),
    t('paywall.freeReading', { count: readingLimit }),
    t('paywall.freeWriting', { count: writingLimit }),
    t('paywall.featNotes'),
    t('paywall.featTranslate'),
    t('paywall.featStreaks'),
  ];
}

function buildProPerks(t: (key: string, vars?: Record<string, string | number>) => string): string[] {
  return [
    t('paywall.proUnlimitedReading'),
    t('paywall.proUnlimitedWriting'),
    t('paywall.featNotes'),
    t('paywall.featTranslate'),
    t('paywall.featReports'),
    t('paywall.featAdaptive'),
  ];
}

type CardTheme = {
  top: string;
  bottom: string;
  badge: string;
};

function cardTheme(variant: PlanCard['variant']): CardTheme {
  if (variant === 'monthly') {
    return {
      top: 'bg-[#EDE9FE]',
      bottom: 'bg-[#E4DFF8]',
      badge: 'bg-[#1A3D2E] text-white',
    };
  }
  return {
    top: 'bg-white',
    bottom: 'bg-[#EFEFEF]',
    badge: 'bg-[#1A3D2E]/90 text-white',
  };
}

export function SubscriptionPlanCards({
  className,
  onSkip,
  freeHref,
  compact,
  variant = 'default',
}: Props) {
  const { t } = useI18n();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: billing } = useBillingStatusQuery(isAuthenticated);
  const { data: publicPrices } = useBillingPricesQuery(!isAuthenticated);
  const checkout = useCheckoutMutation();
  const [pendingPlan, setPendingPlan] = useState<PlanId | null>(null);
  const [selected, setSelected] = useState<PlanId>('month');

  const isDialog = variant === 'dialog' || compact;
  const isPage = variant === 'page' || variant === 'default';
  const isFullLayout = isDialog || isPage;

  const priceSource = billing ?? publicPrices;

  const monthly = priceSource?.prices.monthly.amount ?? 0;
  const yearly = priceSource?.prices.yearly.amount ?? 0;
  const savePercent = priceSource?.prices.yearly.savePercent ?? 0;
  const readingLimit = priceSource?.limits.readingSessionsPerDay ?? 1;
  const writingLimit = priceSource?.limits.writingSessionsPerDay ?? 1;

  const formatPrice = (amount: number) => {
    if (Number.isInteger(amount)) return String(amount);
    return amount.toFixed(2).replace(/\.?0+$/, '');
  };

  const plans = useMemo<PlanCard[]>(
    () => {
      const freePerks = buildFreePerks(t, readingLimit, writingLimit);
      const proPerks = buildProPerks(t);

      return [
        {
          id: 'free',
          label: t('paywall.free'),
          blurb: t('paywall.planBlurbFree'),
          price: 0,
          period: '/m',
          note: t('paywall.planNoteFree'),
          variant: 'free',
          perks: freePerks,
        },
        {
          id: 'month',
          label: t('paywall.monthly'),
          blurb: t('paywall.planBlurbMonthly'),
          price: monthly,
          period: '/m',
          note: t('paywall.planNotePaid'),
          badge: t('paywall.popular'),
          variant: 'monthly',
          perks: proPerks,
        },
        {
          id: 'year',
          label: t('paywall.yearly'),
          blurb: t('paywall.planBlurbYearly'),
          price: yearly,
          period: '/yr',
          note: t('paywall.planNotePaid'),
          badge: t('paywall.save', { percent: savePercent }),
          variant: 'yearly',
          perks: proPerks,
        },
      ];
    },
    [t, readingLimit, writingLimit, monthly, yearly, savePercent],
  );

  const handlePlanAction = (planId: PlanId) => {
    if (planId === 'free') {
      if (onSkip) {
        onSkip();
        return;
      }
      if (freeHref) {
        window.location.href = freeHref;
      }
      return;
    }

    if (isPage && !isAuthenticated) {
      window.location.href = '/signin';
      return;
    }

    setPendingPlan(planId);
    checkout.mutate(planId, {
      onSettled: () => setPendingPlan(null),
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : t('paywall.checkoutFailed')),
    });
  };

  const selectedCtaLabel = () => {
    if (selected === 'free') return t('paywall.subscribeFree');
    if (selected === 'month') return t('paywall.subscribeMonthly');
    return t('paywall.subscribeYearly');
  };

  const handlePrimary = () => {
    handlePlanAction(selected);
  };

  if (isFullLayout) {
    const isPending = pendingPlan !== null;

    const renderPlanCard = (plan: PlanCard, active: boolean, layout: CardLayout) => {
      const theme = cardTheme(plan.variant);
      const isMobileCard = layout === 'mobile';
      const isDesktopFill = layout === 'desktop-fill';

      return (
        <div
          key={plan.id}
          role="button"
          tabIndex={0}
          onClick={() => setSelected(plan.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSelected(plan.id);
            }
          }}
          className={cn(
            'flex cursor-pointer flex-col overflow-hidden rounded-[1.35rem] text-left transition-all',
            isMobileCard && 'h-auto',
            isDesktopFill && 'h-full min-h-0 border-2 shadow-[0_2px_12px_rgba(26,61,46,0.08)]',
            layout === 'desktop-auto' &&
              'h-full border-2 shadow-[0_2px_12px_rgba(26,61,46,0.08)]',
            !isMobileCard &&
              'focus-visible:outline-none focus-visible:border-[#1A3D2E]',
            active &&
              !isMobileCard &&
              'border-[#1A3D2E] shadow-[0_4px_24px_rgba(26,61,46,0.14)]',
            !active && !isMobileCard && 'border-transparent opacity-[0.94] hover:opacity-100',
          )}
        >
          <div className={cn('relative shrink-0 p-5 sm:p-6', theme.top)}>
            {plan.badge ? (
              <span
                className={`${inter.className} absolute right-4 top-4 rounded-full px-2.5 py-1 text-[10px] font-semibold ${theme.badge}`}
              >
                {plan.badge}
              </span>
            ) : null}

            <h3 className={`${inter.className} pr-16 text-base font-semibold text-[#1A3D2E] sm:pr-0`}>
              {plan.label}
            </h3>
            <p className={`${inter.className} mt-1.5 text-xs leading-relaxed text-[#1A3D2E]/55`}>
              {plan.blurb}
            </p>

            <div className="mt-4 sm:mt-5">
              <div className="flex items-baseline gap-0.5">
                <span className={`${bricolage.className} text-3xl font-semibold tracking-tight text-[#1A3D2E] sm:text-4xl`}>
                  ${formatPrice(plan.price)}
                </span>
                <span className={`${inter.className} text-sm text-[#1A3D2E]/50`}>{plan.period}</span>
              </div>
              <p className={`${inter.className} mt-1 text-[11px] text-[#1A3D2E]/45`}>{plan.note}</p>
            </div>
          </div>

          <div
            className={cn(
              'flex flex-col p-5 sm:p-6',
              isMobileCard ? 'pb-5' : 'min-h-0 flex-1 pb-8 sm:pb-10',
              theme.bottom,
            )}
          >
            <div className="shrink-0">
              <p className={`${inter.className} mb-2 text-sm font-semibold text-[#1A3D2E]`}>
                {t('paywall.featuresLabel')}
              </p>
              <ul className={`${inter.className} space-y-1.5 text-xs leading-snug text-[#1A3D2E]/65`}>
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <span className="mt-px flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[#1A3D2E]">
                      <Check className="h-3 w-3" strokeWidth={2} />
                    </span>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
            {!isMobileCard ? <div className="min-h-6 flex-1" aria-hidden /> : null}
          </div>
        </div>
      );
    };

    const selectedPlan = plans.find((p) => p.id === selected) ?? plans[1];
    const desktopLayout: CardLayout = isDialog ? 'desktop-fill' : 'desktop-auto';

    return (
      <div
        className={cn(
          'flex flex-col',
          isDialog && 'min-h-0 flex-1',
          className,
        )}
      >
        <div className="mb-3 flex shrink-0 gap-1.5 md:hidden">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelected(plan.id)}
              className={cn(
                `${inter.className} flex-1 rounded-full px-2 py-2 text-[11px] font-semibold transition-colors`,
                selected === plan.id
                  ? 'bg-[#1A3D2E] text-white'
                  : isPage
                    ? 'bg-black/[0.06] text-[#1A3D2E]/65 hover:bg-black/[0.09] dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/15'
                    : 'bg-white/70 text-[#1A3D2E]/65 hover:bg-white/90',
              )}
            >
              {plan.label}
            </button>
          ))}
        </div>

        <div
          className={cn(
            isDialog ? 'min-h-0 flex-1 overflow-y-auto md:overflow-hidden' : 'overflow-visible',
          )}
        >
          <div className="md:hidden">{renderPlanCard(selectedPlan, false, 'mobile')}</div>

          <div
            className={cn(
              'hidden md:grid md:grid-cols-3 md:gap-4',
              isDialog ? 'h-full' : 'md:items-stretch',
            )}
          >
            {plans.map((plan) => renderPlanCard(plan, selected === plan.id, desktopLayout))}
          </div>
        </div>

        {isDialog ? (
          <div className="relative z-10 mt-4 flex shrink-0 justify-center gap-2 border-t border-[#1A3D2E]/10 pt-4 sm:gap-3">
            <button
              type="button"
              onClick={handlePrimary}
              disabled={isPending}
              className={`${inter.className} inline-flex h-10 w-40 items-center justify-center gap-1.5 rounded-lg bg-[#1A3D2E] text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-48`}
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              <span className="truncate px-1">{selectedCtaLabel()}</span>
            </button>

            {onSkip ? (
              <button
                type="button"
                onClick={onSkip}
                className={`${inter.className} inline-flex h-10 w-28 items-center justify-center rounded-lg border border-[#1A3D2E]/12 bg-white text-xs font-medium text-[#1A3D2E]/50 transition-colors hover:border-[#1A3D2E]/20 hover:text-[#1A3D2E]/70 sm:w-32`}
              >
                {t('paywall.notNow')}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  return null;
}
