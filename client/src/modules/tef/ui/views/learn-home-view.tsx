'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  usePrefetchPractice,
  useTefProfileQuery,
} from '@/modules/tef/hooks/use-tef-queries';
import { useWritingProfileQuery } from '@/modules/writing/hooks/use-writing-queries';
import { LearnBentoGrid } from '@/modules/tef/ui/learn/learn-bento-grid';
import { useAuthStore } from '@/store/authStore';
import { useLessonStore } from '@/store/lessonStore';
import { clearPlacementProgress } from '@/lib/tef-session-storage';
import { handlePaywallError, isAtDailyLimit } from '@/lib/paywall';
import { usePaywallStore } from '@/store/paywallStore';
import { getLearnBentoPlanBadge, isBillingPro } from '@/lib/billing-plan';
import { useBillingStatusQuery } from '@/modules/billing/hooks/use-billing-queries';
import { useI18n } from '@/lib/i18n';
import { overallLevelAndConfidence } from '@/modules/tef/lib/overall-progress';

function LearnSkeleton() {
  return (
    <div className="min-h-dvh">
      <div className="mx-auto flex w-full max-w-6xl flex-col justify-center px-4 pb-6 sm:px-6 md:min-h-dvh">
        <div className="bento-island w-full">
          <Skeleton className="h-[78vh] max-h-[800px] min-h-[480px] w-full rounded-[32px] bg-[#FCFCFC] dark:bg-[#1C1C1C]" />
        </div>
      </div>
    </div>
  );
}

export function LearnHomeView() {
  const router = useRouter();
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);
  const setMode = useLessonStore((s) => s.setMode);
  const { data: profile, isLoading, isError } = useTefProfileQuery(Boolean(user), {
    pollWhilePreparing: true,
  });
  const { data: writingProfile } = useWritingProfileQuery(Boolean(profile?.level));
  const { data: billing } = useBillingStatusQuery(Boolean(profile?.level));
  const openPaywall = usePaywallStore((s) => s.openPaywall);
  const { mutate: requestPrefetch } = usePrefetchPractice();
  const prefetchRequestedRef = useRef(false);

  useEffect(() => {
    if (profile?.practiceReady) {
      prefetchRequestedRef.current = false;
      return;
    }
    if (!profile?.level || prefetchRequestedRef.current) return;
    prefetchRequestedRef.current = true;
    requestPrefetch();
  }, [profile?.level, profile?.practiceReady, requestPrefetch]);

  const handleStartPlacement = () => {
    clearPlacementProgress();
    setMode('placement');
    router.push('/learn/lesson?mode=placement&fresh=1');
  };

  const handleStartPractice = () => {
    if (isAtDailyLimit(billing, 'reading')) {
      openPaywall('reading');
      return;
    }
    setMode('practice');
    router.push('/learn/lesson?mode=practice');
  };

  const handleStartWriting = () => {
    if (isAtDailyLimit(billing, 'writing')) {
      openPaywall('writing');
      return;
    }
    router.push('/learn/writing');
  };

  if (isLoading) return <LearnSkeleton />;

  const placementMode = isError || !profile?.level;
  const firstName = user?.name?.split(' ')[0];

  const summary =
    profile?.summary ||
    writingProfile?.lastEvaluation?.summary ||
    undefined;

  const lastScore = profile?.lastEvaluation
    ? Math.round((profile.lastEvaluation.overallAccuracy ?? 0) * 100)
    : writingProfile?.lastEvaluation?.overallScore ?? null;

  const readingXp = profile?.stats?.readingXp ?? profile?.stats?.xp ?? 0;
  const writingXp = writingProfile?.writingXp ?? profile?.stats?.writingXp ?? 0;
  const overall = overallLevelAndConfidence({
    readingXp,
    writingXp,
    lastScorePct: placementMode ? null : lastScore,
  });

  const bentoData = {
    firstName,
    level: placementMode ? '?' : overall.level,
    confidence: placementMode ? null : overall.confidence,
    summary: placementMode
      ? undefined
      : summary,
    streak: profile?.stats?.streakDays ?? 0,
    xp: readingXp + writingXp,
    planBadge: getLearnBentoPlanBadge(billing, { pro: t('common.pro'), trial: t('common.trial') }),
    showUpgradeToPro: !isBillingPro(billing),
    onUpgradeToPro: () => openPaywall('reading'),
    practiceReady: profile?.practiceReady,
    placementMode,
    onStartPractice: handleStartPractice,
    onStartWriting: handleStartWriting,
    onStartPlacement: handleStartPlacement,
  };

  return (
    <div className="min-h-dvh">
      <div className="mx-auto flex w-full max-w-6xl flex-col justify-center px-4 pb-6 sm:px-6 md:min-h-dvh">
        <div className="bento-island w-full">
          <LearnBentoGrid data={bentoData} />
        </div>
      </div>
    </div>
  );
}
