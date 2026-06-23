'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Flame, Loader2, PenLine, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  usePrefetchPractice,
  useTefProfileQuery,
} from '@/modules/tef/hooks/use-tef-queries';
import { useAuthStore } from '@/store/authStore';
import { useLessonStore } from '@/store/lessonStore';
import { clearPlacementProgress } from '@/lib/tef-session-storage';

export function LearnHomeView() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setMode = useLessonStore((s) => s.setMode);
  const { data: profile, isLoading, isError, refetch } = useTefProfileQuery();
  const prefetch = usePrefetchPractice();

  useEffect(() => {
    if (profile?.level && !profile.practiceReady) {
      prefetch.mutate();
    }
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

  if (isLoading) {
    return (
      <div className="lesson-shell px-4 py-10">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="mt-4 h-12 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !profile?.level) {
    return (
      <div className="lesson-shell items-center justify-center gap-4 px-4 py-16 text-center">
        <h2 className="text-2xl font-extrabold">Let&apos;s find your level</h2>
        <p className="text-muted-foreground">Take a short placement test to get started.</p>
        <Button size="lg" onClick={handleStartPlacement}>
          Start placement
        </Button>
      </div>
    );
  }

  return (
    <div className="lesson-shell px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">
              Bonjour{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
            </CardTitle>
            <CardDescription className="text-base">
              Level <strong className="text-foreground">{profile.level}</strong>
              {profile.confidence != null &&
                ` · ${Math.round(profile.confidence * 100)}% confidence`}
            </CardDescription>
          </CardHeader>
          {profile.summary && (
            <CardContent>
              <p className="rounded-xl bg-muted/60 p-4 text-sm leading-relaxed">{profile.summary}</p>
            </CardContent>
          )}
        </Card>

        {profile.stats && (
          <div className="flex gap-3">
            <Badge variant="outline" className="gap-1 border-duo-orange/30 bg-duo-orange/10 px-3 py-2 text-duo-orange">
              <Flame className="h-4 w-4" /> {profile.stats.streakDays} streak
            </Badge>
            <Badge variant="outline" className="gap-1 border-duo-yellow/30 bg-duo-yellow/10 px-3 py-2 text-amber-700">
              <Star className="h-4 w-4" /> {profile.stats.xp} XP
            </Badge>
          </div>
        )}

        {profile.lastEvaluation && (
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Last session</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-extrabold text-primary">
                  {Math.round((profile.lastEvaluation.overallAccuracy ?? 0) * 100)}%
                </p>
                <p className="text-xs font-semibold capitalize text-muted-foreground">
                  {profile.lastEvaluation.kind}
                </p>
              </div>
              <Badge variant="secondary">{profile.lastEvaluation.levelAfter}</Badge>
            </CardContent>
          </Card>
        )}

        {profile.weakAreas && profile.weakAreas.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-lg font-extrabold">Your focus path</h3>
            {profile.weakAreas.map((tag) => (
              <Card key={tag} className="border-2">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-duo-blue/15">
                    <BookOpen className="h-6 w-6 text-duo-blue" />
                  </div>
                  <div>
                    <p className="font-extrabold capitalize">{tag}</p>
                    <p className="text-xs text-muted-foreground">Recommended practice</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        )}

        <Separator />

        <section className="space-y-3">
          <h3 className="text-lg font-extrabold">Writing practice</h3>
          <Card className="border-2 border-neutral-200">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white">
                <PenLine className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-extrabold">Expression écrite</p>
                <p className="text-xs text-muted-foreground">
                  TCF-style prompts with criteria-based feedback
                </p>
              </div>
              <Button onClick={() => router.push('/learn/writing')}>Start writing</Button>
            </CardContent>
          </Card>
        </section>

        <Separator />

        <div className="space-y-3 pb-8">
          <Button size="lg" className="w-full" onClick={handleStartPractice} disabled={!profile.practiceReady}>
            {profile.practiceReady ? (
              'Start lesson'
            ) : (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Preparing lesson…
              </>
            )}
          </Button>
          <Button size="lg" variant="outline" className="w-full" onClick={handleStartPlacement}>
            Retake placement
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
