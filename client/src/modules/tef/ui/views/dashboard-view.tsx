'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  Energy,
  Loader2,
  PenLine,
  Star,
  Target,
} from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { bricolage, inter } from '@/lib/fonts';
import { useI18n, useLocaleDate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useTefProfileQuery } from '@/modules/tef/hooks/use-tef-queries';
import { overallLevelAndConfidence } from '@/modules/tef/lib/overall-progress';
import {
  useBillingPortalMutation,
  useBillingStatusQuery,
} from '@/modules/billing/hooks/use-billing-queries';
import { useWritingProfileQuery } from '@/modules/writing/hooks/use-writing-queries';
import { useAuthStore } from '@/store/authStore';
import { usePaywallStore } from '@/store/paywallStore';

const panel = 'rounded-[28px] bg-[#FCFCFC] dark:bg-[#1C1C1C] sm:rounded-[32px]';
const ink = 'text-[#675549] dark:text-white';
const inkMuted = 'text-[#675549]/80 dark:text-white/70';
const gold = 'text-[#C9A227] dark:text-[#A8860D]';

function StatCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className={cn(inter.className, 'text-[11px] font-medium uppercase tracking-wide', inkMuted)}>
        {label}
      </p>
      <p
        className={cn(
          bricolage.className,
          'mt-1 text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl',
          accent ? gold : ink,
        )}
      >
        {value}
      </p>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[#675549]/10 py-2.5 last:border-0 dark:border-white/10">
      <span className={cn(inter.className, 'text-sm', inkMuted)}>{label}</span>
      <span className={cn(inter.className, 'text-sm font-medium', ink)}>{value}</span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-4 pt-10 pb-10 sm:px-6">
      <Skeleton className={cn(panel, 'h-40 w-full')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className={cn(panel, 'h-44 w-full')} />
        <Skeleton className={cn(panel, 'h-44 w-full')} />
      </div>
      <Skeleton className={cn(panel, 'h-36 w-full')} />
    </div>
  );
}

export function DashboardView() {
  const router = useRouter();
  const { t } = useI18n();
  const formatDate = useLocaleDate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const { data: profile, isLoading } = useTefProfileQuery(Boolean(user));
  const { data: writingProfile } = useWritingProfileQuery(Boolean(profile?.level));
  const { data: billing, isLoading: billingLoading } = useBillingStatusQuery(Boolean(user));
  const billingPortal = useBillingPortalMutation();
  const openPaywall = usePaywallStore((s) => s.openPaywall);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user && !isAuthenticated) {
      router.replace('/signin');
    }
  }, [hasHydrated, user, isAuthenticated, router]);

  if (!hasHydrated || !user) return <DashboardSkeleton />;
  if (isLoading) return <DashboardSkeleton />;

  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const joinedRaw = formatDate(user.createdAt) || formatDate(profile?.onboardedAt);
  const joined = joinedRaw || null;
  const onboarded = formatDate(profile?.onboardedAt) || null;
  const lastLogin = formatDate(user.lastLoginAt) || null;

  const readingLevel = profile?.level ?? '—';
  const writingLevel = writingProfile?.writingLevel ?? writingProfile?.level ?? '—';
  const readingXp = profile?.stats?.readingXp ?? profile?.stats?.xp ?? 0;
  const writingXp = writingProfile?.writingXp ?? profile?.stats?.writingXp ?? 0;
  const streak = profile?.stats?.streakDays ?? 0;
  const sessions = profile?.stats?.totalSessions ?? 0;
  const questions = profile?.stats?.totalQuestions ?? 0;

  const lastReadingScore = profile?.lastEvaluation
    ? Math.round((profile.lastEvaluation.overallAccuracy ?? 0) * 100)
    : null;
  const lastWritingScore = writingProfile?.lastEvaluation?.overallScore ?? null;
  const lastScorePct = lastReadingScore ?? lastWritingScore;
  const overall = overallLevelAndConfidence({
    readingXp,
    writingXp,
    lastScorePct,
  });
  const writingProgress = writingProfile?.writingProgress;

  const weakAreas = profile?.weakAreas ?? [];
  const taskModeLabel = writingProfile?.taskMode
    ? writingProfile.taskMode.split('_').join(' ')
    : null;

  const isPro = billing?.plan === 'pro';
  const accessExpires = billing?.currentPeriodEnd
    ? formatDate(billing.currentPeriodEnd)
    : null;
  const accessType =
    billing?.subscriptionInterval === 'year'
      ? t('dashboard.accessYearly')
      : billing?.subscriptionInterval === 'month'
        ? t('dashboard.accessMonthly')
        : '—';
  const planStatus =
    billing?.subscriptionStatus === 'active'
      ? t('dashboard.statusActive')
      : billing?.subscriptionStatus === 'canceled'
        ? t('dashboard.statusExpired')
        : t('dashboard.statusNone');
  const readingUsage = billing
    ? isPro
      ? t('dashboard.unlimited')
      : `${billing.usage.readingSessions}/${billing.limits.readingSessionsPerDay ?? '—'}`
    : '—';
  const writingUsage = billing
    ? isPro
      ? t('dashboard.unlimited')
      : `${billing.usage.writingSessions}/${billing.limits.writingSessionsPerDay ?? '—'}`
    : '—';
  const notesUsage = billing
    ? isPro
      ? t('dashboard.unlimited')
      : `${billing.usage.notesCount ?? 0}/${billing.limits.notesMax ?? '—'}`
    : '—';
  const translationsUsage = billing
    ? isPro
      ? t('dashboard.unlimited')
      : `${billing.usage.translationsTotal ?? 0}/${billing.limits.translationsMax ?? '—'}`
    : '—';

  return (
    <div className="min-h-dvh p-10">
      <div className="mx-auto w-full max-w-5xl space-y-4 px-4 sm:px-6">
        <section className={cn(panel, 'px-6 py-6 sm:px-8 sm:py-7')}>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar className="h-16 w-16 shrink-0 sm:h-18 sm:w-18">
                <AvatarImage src={user.picture ?? undefined} alt={user.name} />
                <AvatarFallback className="bg-[#7B61FF] text-lg font-semibold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h1 className={cn(bricolage.className, 'truncate text-2xl font-semibold sm:text-3xl', ink)}>
                  {user.name}
                </h1>
                <p className={cn(inter.className, 'mt-0.5 truncate text-sm', inkMuted)}>{user.email}</p>
                {joined && (
                  <p className={cn(inter.className, 'mt-2 inline-flex items-center gap-1.5 text-xs', inkMuted)}>
                    <Calendar className="h-3.5 w-3.5" strokeWidth={2} />
                    {t('dashboard.joined', { date: joined })}
                  </p>
                )}
              </div>
            </div>

            <Link
              href="/learn"
              className={cn(
                inter.className,
                'inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-neutral-900 px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-neutral-900',
              )}
            >
              {t('common.backToLearn')}
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
          </div>

          {(onboarded || lastLogin) && (
            <div className="mt-5 border-t border-[#675549]/12 dark:border-white/10">
              {onboarded && <MetaRow label={t('dashboard.readingOnboarded')} value={onboarded} />}
              {lastLogin && <MetaRow label={t('dashboard.lastLogin')} value={lastLogin} />}
            </div>
          )}
        </section>

        <section className={cn(panel, 'px-6 py-5 sm:px-7')}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Star
                className={cn('h-4 w-4', isPro ? 'fill-[#C9A227] text-[#C9A227]' : inkMuted)}
                strokeWidth={2}
              />
              <h2 className={cn(inter.className, 'text-xs font-semibold uppercase tracking-wide', inkMuted)}>
                {t('dashboard.planAndBilling')}
              </h2>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {isPro ? (
                <>
                  {billing?.canManageBilling ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={billingPortal.isPending}
                      onClick={() =>
                        billingPortal.mutate(undefined, {
                          onError: (err) =>
                            toast.error(
                              err instanceof Error ? err.message : t('dashboard.portalFailed'),
                            ),
                        })
                      }
                      className={cn(
                        inter.className,
                        'h-8 rounded-full border-[#675549]/20 text-xs font-semibold dark:border-white/15',
                      )}
                    >
                      {billingPortal.isPending ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          {t('dashboard.openingPortal')}
                        </>
                      ) : (
                        t('dashboard.manageSubscription')
                      )}
                    </Button>
                  ) : null}
                  <span
                    className={cn(
                      inter.className,
                      'rounded-full bg-[#1A3D2E] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white',
                    )}
                  >
                    {t('common.pro')}
                  </span>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => openPaywall('reading')}
                    className={cn(
                      inter.className,
                      'h-8 rounded-full bg-[#1A3D2E] text-xs font-semibold text-white hover:bg-[#1A3D2E]/90',
                    )}
                  >
                    {t('dashboard.upgradeToPro')}
                  </Button>
                  <span
                    className={cn(
                      inter.className,
                      'rounded-full border border-[#675549]/20 bg-[#675549]/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#675549] dark:border-white/15 dark:bg-white/10 dark:text-white/80',
                    )}
                  >
                    {t('common.freePlan')}
                  </span>
                </>
              )}
            </div>
          </div>

          {billingLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-2/3" />
            </div>
          ) : (
            <div className="space-y-0">
              {isPro ? (
                <>
                  <MetaRow label={t('dashboard.planStatus')} value={planStatus} />
                  <MetaRow label={t('dashboard.accessType')} value={accessType} />
                  <MetaRow
                    label={t('dashboard.accessExpires')}
                    value={accessExpires ?? t('dashboard.noExpiry')}
                  />
                  <MetaRow label={t('dashboard.readingToday')} value={readingUsage} />
                  <MetaRow label={t('dashboard.writingToday')} value={writingUsage} />
                  <MetaRow label={t('dashboard.notesUsage')} value={notesUsage} />
                  <MetaRow label={t('dashboard.translationsUsage')} value={translationsUsage} />
                </>
              ) : (
                <>
                  <MetaRow label={t('dashboard.currentPlan')} value={t('common.freePlan')} />
                  <MetaRow label={t('dashboard.planStatus')} value={t('dashboard.statusFree')} />
                  <MetaRow label={t('dashboard.readingToday')} value={readingUsage} />
                  <MetaRow label={t('dashboard.writingToday')} value={writingUsage} />
                  <MetaRow label={t('dashboard.notesUsage')} value={notesUsage} />
                  <MetaRow label={t('dashboard.translationsUsage')} value={translationsUsage} />
                </>
              )}
            </div>
          )}
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className={cn(panel, 'px-6 py-5 sm:px-7')}>
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className={cn('h-4 w-4', inkMuted)} strokeWidth={2} />
              <h2 className={cn(inter.className, 'text-xs font-semibold uppercase tracking-wide', inkMuted)}>
                {t('common.reading')}
              </h2>
            </div>
            <p className={cn(bricolage.className, 'text-4xl font-semibold tracking-tight', ink)}>
              {readingLevel}
            </p>
            <p className={cn(inter.className, 'mt-2 text-sm', inkMuted)}>
              {t('dashboard.practiceLevelMcq')}
            </p>
            <p className={cn(bricolage.className, 'mt-4 text-2xl font-semibold tabular-nums', gold)}>
              {readingXp}
              <span className={cn(inter.className, 'ml-1.5 text-sm font-medium', inkMuted)}>{t('common.xp')}</span>
            </p>
          </div>

          <div className={cn(panel, 'px-6 py-5 sm:px-7')}>
            <div className="mb-4 flex items-center gap-2">
              <PenLine className={cn('h-4 w-4', inkMuted)} strokeWidth={2} />
              <h2 className={cn(inter.className, 'text-xs font-semibold uppercase tracking-wide', inkMuted)}>
                {t('common.writing')}
              </h2>
            </div>
            <p className={cn(bricolage.className, 'text-4xl font-semibold tracking-tight', ink)}>
              {writingLevel}
            </p>
            <p className={cn(inter.className, 'mt-2 text-sm', inkMuted)}>
              {writingProgress?.nextLevel
                ? t('dashboard.xpToLevel', {
                    xp: writingProgress.xpToNext,
                    level: writingProgress.nextLevel,
                  })
                : taskModeLabel
                  ? t('dashboard.mode', { mode: taskModeLabel })
                  : t('dashboard.startWritingUnlock')}
            </p>
            <p className={cn(bricolage.className, 'mt-4 text-2xl font-semibold tabular-nums', gold)}>
              {writingXp}
              <span className={cn(inter.className, 'ml-1.5 text-sm font-medium', inkMuted)}>{t('common.xp')}</span>
            </p>
          </div>
        </section>

        <section className={cn(panel, 'px-6 py-5 sm:px-7')}>
          <div className="mb-5 flex items-center gap-2">
            <Energy className={cn('h-4 w-4', inkMuted)} strokeWidth={2} />
            <h2 className={cn(inter.className, 'text-xs font-semibold uppercase tracking-wide', inkMuted)}>
              {t('dashboard.activity')}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <StatCell label={t('dashboard.streak')} value={`${streak}d`} accent />
            <StatCell label={t('dashboard.sessions')} value={sessions} />
            <StatCell label={t('dashboard.questions')} value={questions} />
            <StatCell label={t('dashboard.totalXp')} value={readingXp + writingXp} accent />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className={cn(panel, 'px-6 py-5 sm:px-7')}>
            <div className="mb-4 flex items-center gap-2">
              <Target className={cn('h-4 w-4', inkMuted)} strokeWidth={2} />
              <h2 className={cn(inter.className, 'text-xs font-semibold uppercase tracking-wide', inkMuted)}>
                {t('dashboard.focusAreas')}
              </h2>
            </div>
            {weakAreas.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {weakAreas.map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      inter.className,
                      'rounded-full bg-[#675549]/10 px-3 py-1.5 text-xs font-medium capitalize',
                      ink,
                      'dark:bg-white/10',
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className={cn(inter.className, 'text-sm', inkMuted)}>
                {t('dashboard.practiceWeak')}
              </p>
            )}
            {profile?.summary && (
              <p className={cn(inter.className, 'mt-4 text-sm leading-relaxed', inkMuted)}>
                {profile.summary}
              </p>
            )}
          </div>

          <div className={cn(panel, 'px-6 py-5 sm:px-7')}>
            <div className="mb-4 flex items-center gap-2">
              <Award className={cn('h-4 w-4', inkMuted)} strokeWidth={2} />
              <h2 className={cn(inter.className, 'text-xs font-semibold uppercase tracking-wide', inkMuted)}>
                {t('dashboard.lastActivity')}
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className={cn(inter.className, 'inline-flex items-center gap-1.5 text-sm font-medium', ink)}>
                    <BookOpen className="h-3.5 w-3.5" strokeWidth={2} />
                    {t('common.reading')}
                  </span>
                  {lastReadingScore != null ? (
                    <span className={cn(bricolage.className, 'text-xl font-semibold tabular-nums', ink)}>
                      {lastReadingScore}%
                    </span>
                  ) : (
                    <span className={cn(inter.className, 'text-sm', inkMuted)}>—</span>
                  )}
                </div>
                {profile?.lastEvaluation && (
                  <p className={cn(inter.className, 'mt-1 text-xs', inkMuted)}>
                    {[profile.lastEvaluation.kind, formatDate(profile.lastEvaluation.createdAt)]
                      .filter(Boolean)
                      .join(' · ')}
                    {profile.lastEvaluation.levelAfter
                      ? ` · ${profile.lastEvaluation.levelAfter}`
                      : ''}
                  </p>
                )}
              </div>

              <div className="border-t border-[#675549]/10 pt-4 dark:border-white/10">
                <div className="flex items-center justify-between gap-3">
                  <span className={cn(inter.className, 'inline-flex items-center gap-1.5 text-sm font-medium', ink)}>
                    <PenLine className="h-3.5 w-3.5" strokeWidth={2} />
                    {t('common.writing')}
                  </span>
                  {lastWritingScore != null ? (
                    <span className={cn(bricolage.className, 'text-xl font-semibold tabular-nums', ink)}>
                      {lastWritingScore}%
                    </span>
                  ) : (
                    <span className={cn(inter.className, 'text-sm', inkMuted)}>—</span>
                  )}
                </div>
                {writingProfile?.lastEvaluation && (
                  <p className={cn(inter.className, 'mt-1 text-xs', inkMuted)}>
                    {formatDate(writingProfile.lastEvaluation.createdAt) || t('dashboard.recent')}
                    {writingProfile.lastEvaluation.summary
                      ? ` · ${writingProfile.lastEvaluation.summary}`
                      : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/learn"
            className={cn(
              panel,
              inter.className,
              'flex items-center justify-between px-5 py-4 text-sm font-medium transition-opacity hover:opacity-90',
              ink,
            )}
          >
            <span className="inline-flex items-center gap-2">
              <Star className="h-4 w-4" strokeWidth={2} />
              {t('dashboard.continueReading')}
            </span>
            <ArrowRight className="h-4 w-4 opacity-60" strokeWidth={2} />
          </Link>
          <Link
            href="/learn/writing"
            className={cn(
              panel,
              inter.className,
              'flex items-center justify-between px-5 py-4 text-sm font-medium transition-opacity hover:opacity-90',
              ink,
            )}
          >
            <span className="inline-flex items-center gap-2">
              <PenLine className="h-4 w-4" strokeWidth={2} />
              {t('dashboard.continueWriting')}
            </span>
            <ArrowRight className="h-4 w-4 opacity-60" strokeWidth={2} />
          </Link>
        </section>
      </div>
    </div>
  );
}
