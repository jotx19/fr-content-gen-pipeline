'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
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
  const user = useAuthStore((s) => s.user);
  const setMode = useLessonStore((s) => s.setMode);
  const { data: profile, isLoading, isError, refetch } = useTefProfileQuery();
  const { data: writingProfile } = useWritingProfileQuery(Boolean(profile?.level));
  const prefetch = usePrefetchPractice();

  useEffect(() => {
    if (profile?.level && !profile.practiceReady) prefetch.mutate();
  }, [profile?.level, profile?.practiceReady]);

  useEffect(() => {
    if (!profile?.level || profile.practiceReady) return;
    const timer = setInterval(() => refetch(), 3000);
    return () => clearInterval(timer);
  }, [profile?.level, profile?.practiceReady, refetch]);

  const handleStartPlacement = () => {
    clearPlacementProgress();
    setMode('placement');
    router.push('/learn/lesson?mode=placement&fresh=1');
  };

  const handleStartPractice = () => {
    setMode('practice');
    router.push('/learn/lesson?mode=practice');
  };

  const handleStartWriting = () => {
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

  const bentoData = {
    firstName,
    level: profile?.level ?? '?',
    confidence: profile?.confidence,
    summary: placementMode
      ? undefined
      : summary,
    streak: profile?.stats?.streakDays ?? 0,
    xp: profile?.stats?.readingXp ?? profile?.stats?.xp ?? 0,
    lastScore: placementMode ? null : lastScore,
    lastKind: profile?.lastEvaluation?.kind,
    lastLevel: profile?.lastEvaluation?.levelAfter ?? profile?.level,
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
