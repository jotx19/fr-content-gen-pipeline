'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  BookOpen,
  Flame,
  GraduationCap,
  Loader2,
  LogOut,
  Moon,
  Star,
  Sun,
  X,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  PracticeBatch,
  PublicQuestion,
  TefDiagnostic,
  TefProfile,
  tefGetPractice,
  tefGetProfile,
  tefPrefetchPractice,
  tefStartOnboard,
  tefSubmitOnboard,
  tefSubmitPractice,
} from '@/lib/tef-api';
import {
  clearPlacementProgress,
  loadPlacementProgress,
  savePlacementProgress,
} from '@/lib/tef-storage';
import type { AuthUser } from '@/lib/auth-api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { McqQuestion } from './McqQuestion';
import { TefResults } from './TefResults';

const PHASE = {
  INIT: 'init',
  PLACEMENT: 'placement',
  HOME: 'home',
  PRACTICE: 'practice',
  RESULTS: 'results',
} as const;

type Phase = (typeof PHASE)[keyof typeof PHASE];

type Props = {
  user: AuthUser | null;
  onLogout: () => void;
  onAuthError?: () => void;
};

export function TefApp({ user, onLogout, onAuthError }: Props) {
  const { theme, setTheme } = useTheme();
  const [phase, setPhase] = useState<Phase>(PHASE.INIT);
  const [profile, setProfile] = useState<TefProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [batch, setBatch] = useState<{ questions: PublicQuestion[]; topic?: string } | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [diagnostic, setDiagnostic] = useState<TefDiagnostic | null>(null);
  const [batchKind, setBatchKind] = useState<'placement' | 'practice' | null>(null);
  const [practiceReady, setPracticeReady] = useState(false);
  const [checked, setChecked] = useState(false);
  const [shake, setShake] = useState(false);

  const handleApiError = useCallback(
    (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Request failed';
      if (message.includes('sign in')) {
        onAuthError?.();
        return;
      }
      setError(message);
    },
    [onAuthError]
  );

  const loadPlacementBatch = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const saved = loadPlacementProgress();
      if (saved.questions?.length) {
        setBatch({ questions: saved.questions });
        setAnswers(saved.answers ?? new Array(saved.questions.length).fill(null));
        setCurrentQIdx(saved.currentIdx ?? 0);
        setBatchKind('placement');
        setPhase(PHASE.PLACEMENT);
        return;
      }
      const data = await tefStartOnboard();
      if (!data.questions?.length) throw new Error('No placement questions returned');
      setBatch(data);
      setAnswers(new Array(data.questions.length).fill(null));
      setCurrentQIdx(0);
      setBatchKind('placement');
      setPhase(PHASE.PLACEMENT);
      savePlacementProgress({ questions: data.questions, answers: [], currentIdx: 0 });
    } catch (err) {
      handleApiError(err);
    } finally {
      setBusy(false);
    }
  }, [handleApiError]);

  useEffect(() => {
    if (phase !== PHASE.INIT) return;
    async function boot() {
      setBusy(true);
      try {
        const serverProfile = await tefGetProfile();
        if (serverProfile?.level) {
          setProfile(serverProfile);
          setPracticeReady(Boolean(serverProfile.practiceReady));
          setPhase(PHASE.HOME);
          return;
        }
        await loadPlacementBatch();
      } catch {
        await loadPlacementBatch();
      } finally {
        setBusy(false);
      }
    }
    boot();
  }, [phase, loadPlacementBatch]);

  useEffect(() => {
    if (phase !== PHASE.HOME || !profile?.level) return;
    if (!practiceReady) tefPrefetchPractice();
    if (practiceReady) return;

    let cancelled = false;
    const check = async () => {
      const p = await tefGetProfile();
      if (!cancelled && p?.practiceReady) {
        setPracticeReady(true);
        setProfile((prev) => (prev ? { ...prev, practiceReady: true } : prev));
      }
    };
    check();
    const timer = setInterval(check, 3000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [phase, profile?.level, practiceReady]);

  const persistPlacement = (nextAnswers: (number | null)[], idx: number) => {
    if (!batch?.questions) return;
    savePlacementProgress({ questions: batch.questions, answers: nextAnswers, currentIdx: idx });
  };

  const submitPlacement = async () => {
    if (!batch?.questions || answers.some((a) => a == null)) return;
    setBusy(true);
    setError(null);
    try {
      const data = await tefSubmitOnboard(answers as number[]);
      const nextProfile: TefProfile = data.profile ?? {
        level: data.estimatedLevel || 'B1',
        confidence: data.confidence,
        weakAreas: data.weakAreas || [],
        summary: data.summary,
        onboardedAt: new Date().toISOString(),
      };
      clearPlacementProgress();
      setProfile(nextProfile);
      setPracticeReady(false);
      setDiagnostic(data);
      setPhase(PHASE.RESULTS);
      tefPrefetchPractice();
    } catch (err) {
      handleApiError(err);
    } finally {
      setBusy(false);
    }
  };

  const startPractice = async () => {
    setBusy(true);
    setError(null);
    try {
      const data: PracticeBatch = await tefGetPractice();
      if (!data.questions?.length) throw new Error('No practice questions returned');
      setBatch(data);
      setAnswers(new Array(data.questions.length).fill(null));
      setCurrentQIdx(0);
      setBatchKind('practice');
      setChecked(false);
      setPhase(PHASE.PRACTICE);
    } catch (err) {
      handleApiError(err);
    } finally {
      setBusy(false);
    }
  };

  const submitPractice = async () => {
    if (!batch?.questions || answers.some((a) => a == null)) return;
    setBusy(true);
    setError(null);
    try {
      const data = await tefSubmitPractice(answers as number[]);
      setDiagnostic(data);
      if (data.profile) setProfile(data.profile);
      setPhase(PHASE.RESULTS);
    } catch (err) {
      handleApiError(err);
    } finally {
      setBusy(false);
    }
  };

  const retakePlacement = () => {
    clearPlacementProgress();
    setProfile(null);
    setBatch(null);
    setDiagnostic(null);
    setAnswers([]);
    setCurrentQIdx(0);
    setChecked(false);
    setPhase(PHASE.INIT);
  };

  const goNextQuestion = () => {
    setChecked(false);
    setShake(false);
    if (batch?.questions && currentQIdx < batch.questions.length - 1) {
      setCurrentQIdx((i) => i + 1);
      if (batchKind === 'placement') persistPlacement(answers, currentQIdx + 1);
    }
  };

  const handleCheck = () => {
    if (answers[currentQIdx] == null) return;
    setChecked(true);
  };

  const currentQuestion = batch?.questions?.[currentQIdx];
  const isLastQuestion = batch?.questions && currentQIdx === batch.questions.length - 1;
  const isPlacement = batchKind === 'placement' && phase === PHASE.PLACEMENT;
  const isPractice = batchKind === 'practice' && phase === PHASE.PRACTICE;
  const inLesson = (isPlacement || isPractice) && currentQuestion && batch;
  const progressPct = batch?.questions?.length
    ? Math.round(((currentQIdx + (checked ? 1 : 0)) / batch.questions.length) * 100)
    : 0;

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'TC';

  return (
    <div className="lesson-shell">
      <header className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-extrabold">TEF Coach</span>
          </div>
          <div className="flex items-center gap-2">
            {profile?.stats && (
              <>
                <Badge variant="outline" className="gap-1 border-duo-orange/30 bg-duo-orange/10 text-duo-orange">
                  <Flame className="h-3.5 w-3.5" />
                  {profile.stats.streakDays}
                </Badge>
                <Badge variant="outline" className="gap-1 border-duo-yellow/30 bg-duo-yellow/10 text-amber-700 dark:text-duo-yellow">
                  <Star className="h-3.5 w-3.5" />
                  {profile.stats.xp}
                </Badge>
              </>
            )}
            {profile?.level && (
              <Badge className="bg-primary">{profile.level}</Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {user && (
              <Avatar className="h-9 w-9 border-2 border-border">
                <AvatarImage src={user.picture ?? undefined} alt={user.name} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            )}
            <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {inLesson && (
          <Progress value={progressPct} className="mt-3 h-3" />
        )}
      </header>

      {error && (
        <div className="mx-4 mt-4 flex items-center gap-2 rounded-2xl border-2 border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError(null)} aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <main className="flex-1 px-4 py-6">
        {phase === PHASE.INIT && (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="font-bold text-muted-foreground">
              {busy ? 'Preparing your lesson…' : 'Loading…'}
            </p>
            <Skeleton className="h-4 w-48" />
          </div>
        )}

        {inLesson && (
          <div className="pb-28">
            <McqQuestion
              question={currentQuestion}
              questionNumber={currentQIdx + 1}
              totalQuestions={batch.questions.length}
              selectedIndex={answers[currentQIdx]}
              onSelect={(idx) => {
                if (checked) return;
                setAnswers((prev) => {
                  const next = [...prev];
                  next[currentQIdx] = idx;
                  if (isPlacement) persistPlacement(next, currentQIdx);
                  return next;
                });
              }}
              disabled={busy || checked}
              showResult={checked && isPractice}
              shake={shake}
            />
          </div>
        )}

        {phase === PHASE.HOME && profile && (
          <div className="space-y-6 animate-bounce-in">
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
                <div className="space-y-3">
                  {profile.weakAreas.map((tag, i) => (
                    <Card
                      key={tag}
                      className="border-2 transition-transform hover:scale-[1.01]"
                      style={{ opacity: 1 - i * 0.08 }}
                    >
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
                </div>
              </section>
            )}

            <Separator />

            <div className="space-y-3 pb-8">
              <Button size="lg" className="w-full" onClick={startPractice} disabled={busy}>
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading…
                  </>
                ) : practiceReady ? (
                  'Start lesson'
                ) : (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Preparing lesson…
                  </>
                )}
              </Button>
              <Button size="lg" variant="outline" className="w-full" onClick={retakePlacement} disabled={busy}>
                Retake placement
              </Button>
            </div>
          </div>
        )}

        {phase === PHASE.RESULTS && diagnostic && (
          <TefResults
            diagnostic={diagnostic}
            profile={profile}
            onPracticeAgain={() => {
              setDiagnostic(null);
              setChecked(false);
              if (profile?.level) startPractice();
              else retakePlacement();
            }}
            onRetakePlacement={retakePlacement}
          />
        )}
      </main>

      {inLesson && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 p-4 backdrop-blur">
          <div className="mx-auto max-w-lg">
            {!checked ? (
              <Button
                size="lg"
                className="w-full uppercase tracking-wide"
                disabled={answers[currentQIdx] == null || busy}
                onClick={() => {
                  if (isPlacement) {
                    if (isLastQuestion) submitPlacement();
                    else {
                      setCurrentQIdx((i) => i + 1);
                      persistPlacement(answers, currentQIdx + 1);
                    }
                  } else {
                    handleCheck();
                  }
                }}
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Scoring…
                  </>
                ) : isPlacement ? (
                  isLastQuestion ? 'Finish' : 'Continue'
                ) : (
                  'Check'
                )}
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full uppercase tracking-wide"
                disabled={busy}
                onClick={() => {
                  if (isLastQuestion) submitPractice();
                  else goNextQuestion();
                }}
              >
                {isLastQuestion ? (busy ? 'Scoring…' : 'Finish') : 'Continue'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
