'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, ClipboardList, Loader2 } from '@/components/icons';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { bricolage } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import {
  clearPlacementProgress,
  loadPlacementProgress,
  savePlacementProgress,
} from '@/lib/tef-session-storage';
import { playMcqCorrectSound, playMcqWrongSound } from '@/lib/mcq-sounds';
import { McqQuestion } from '@/modules/tef/ui/components/mcq-question';
import {
  useCheckAnswerMutation,
  usePracticeQuery,
  useStartOnboardMutation,
  useSubmitOnboardMutation,
  useSubmitPracticeMutation,
} from '@/modules/tef/hooks/use-tef-queries';
import type { PublicQuestion } from '@/modules/tef/types/tef';
import { useLessonStore } from '@/store/lessonStore';

const panelClass = 'bg-[#FCFCFC] dark:bg-[#1C1C1C]';

function segmentTone({
  index,
  currentIdx,
  checked,
  answer,
  correctIndex,
}: {
  index: number;
  currentIdx: number;
  checked: boolean;
  answer: number | null;
  correctIndex: number | null;
}) {
  if (index > currentIdx) return 'bg-black/8 dark:bg-white/10';
  if (index < currentIdx) {
    if (correctIndex != null && answer != null) {
      return answer === correctIndex ? 'bg-primary' : 'bg-destructive/80';
    }
    return 'bg-primary/70';
  }
  if (checked && correctIndex != null && answer != null) {
    return answer === correctIndex ? 'bg-primary' : 'bg-destructive/80';
  }
  return 'bg-primary/45';
}

export function LessonView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get('mode') as 'placement' | 'practice') || 'practice';
  const isFresh = searchParams.get('fresh') === '1';

  const setLastDiagnostic = useLessonStore((s) => s.setLastDiagnostic);
  const startOnboard = useStartOnboardMutation();
  const submitOnboard = useSubmitOnboardMutation();
  const submitPractice = useSubmitPracticeMutation();
  const checkAnswer = useCheckAnswerMutation();

  const practiceQuery = usePracticeQuery(mode === 'practice');

  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [topic, setTopic] = useState<string | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [correctIndices, setCorrectIndices] = useState<(number | null)[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [checked, setChecked] = useState(false);
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(true);

  const placementInitRef = useRef(false);
  const practiceInitRef = useRef(false);

  useEffect(() => {
    placementInitRef.current = false;
    practiceInitRef.current = false;
    setQuestions([]);
    setTopic(null);
    setAnswers([]);
    setCorrectIndices([]);
    setCurrentIdx(0);
    setChecked(false);
    setShake(false);
    setLoading(true);
  }, [mode, isFresh]);

  useEffect(() => {
    if (mode !== 'placement' || placementInitRef.current) return;

    let cancelled = false;
    placementInitRef.current = true;

    async function loadPlacement() {
      try {
        const saved = loadPlacementProgress();
        if (saved.questions?.length && !isFresh) {
          if (cancelled) return;
          setQuestions(saved.questions);
          setAnswers(saved.answers ?? new Array(saved.questions.length).fill(null));
          setCorrectIndices(new Array(saved.questions.length).fill(null));
          setCurrentIdx(saved.currentIdx ?? 0);
          return;
        }

        clearPlacementProgress();
        const data = await startOnboard.mutateAsync();
        if (cancelled) return;
        if (!data.questions?.length) throw new Error('No questions returned');

        setQuestions(data.questions);
        setAnswers(new Array(data.questions.length).fill(null));
        setCorrectIndices(new Array(data.questions.length).fill(null));
        setCurrentIdx(0);
        savePlacementProgress({ questions: data.questions, answers: [], currentIdx: 0 });
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : 'Failed to load placement');
          router.replace('/learn');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPlacement();
    return () => {
      cancelled = true;
    };
  }, [mode, isFresh, router]);

  useEffect(() => {
    if (mode !== 'practice' || practiceInitRef.current) return;

    if (practiceQuery.isError) {
      practiceInitRef.current = true;
      toast.error('Failed to load practice');
      router.replace('/learn');
      return;
    }

    if (!practiceQuery.isSuccess || !practiceQuery.data?.questions?.length) return;

    practiceInitRef.current = true;
    setQuestions(practiceQuery.data.questions);
    setTopic(practiceQuery.data.topic ?? null);
    setAnswers(new Array(practiceQuery.data.questions.length).fill(null));
    setCorrectIndices(new Array(practiceQuery.data.questions.length).fill(null));
    setCurrentIdx(0);
    setLoading(false);
  }, [mode, practiceQuery.isSuccess, practiceQuery.isError, practiceQuery.data, router]);

  const persistPlacement = (nextAnswers: (number | null)[], idx: number) => {
    savePlacementProgress({ questions, answers: nextAnswers, currentIdx: idx });
  };

  const handleCheck = async () => {
    const answer = answers[currentIdx];
    if (answer == null || checked) return;

    try {
      const result = await checkAnswer.mutateAsync({
        kind: mode,
        questionIndex: currentIdx,
        userAnswer: answer,
      });
      setCorrectIndices((prev) => {
        const next = [...prev];
        next[currentIdx] = result.correctIndex;
        return next;
      });
      setChecked(true);
      setShake(!result.correct);
      if (result.correct) {
        playMcqCorrectSound();
      } else {
        playMcqWrongSound();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not check answer');
    }
  };

  const handleClearSelection = () => {
    if (checked || answers[currentIdx] == null) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIdx] = null;
      if (isPlacement) persistPlacement(next, currentIdx);
      return next;
    });
  };

  const goToNext = () => {
    setChecked(false);
    setShake(false);
    setCurrentIdx((i) => i + 1);
    if (mode === 'placement') persistPlacement(answers, currentIdx + 1);
  };

  const finishPlacement = async () => {
    if (answers.some((a) => a == null)) return;
    try {
      const data = await submitOnboard.mutateAsync(answers as number[]);
      clearPlacementProgress();
      setLastDiagnostic(data);
      router.push('/learn/results');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Submit failed');
    }
  };

  const finishPractice = async () => {
    if (answers.some((a) => a == null)) return;
    try {
      const data = await submitPractice.mutateAsync(answers as number[]);
      setLastDiagnostic(data);
      router.push('/learn/results');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Submit failed');
    }
  };

  const isPlacement = mode === 'placement';
  const isLast = questions.length > 0 && currentIdx === questions.length - 1;
  const progressPct = questions.length
    ? Math.round(((currentIdx + (checked ? 1 : 0)) / questions.length) * 100)
    : 0;
  const busy =
    submitOnboard.isPending || submitPractice.isPending || checkAnswer.isPending;
  const currentQuestion = questions[currentIdx];

  const title = useMemo(
    () => (isPlacement ? 'Placement test' : topic ? topic : 'Practice'),
    [isPlacement, topic]
  );

  const modeLabel = isPlacement ? 'Placement' : 'Practice';
  const ModeIcon = isPlacement ? ClipboardList : BookOpen;

  if (loading || (mode === 'practice' && practiceQuery.isLoading)) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col items-center justify-center gap-4 px-4 py-20 sm:max-w-3xl">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <Skeleton className={cn('h-4 w-48 rounded-md', panelClass)} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col sm:max-w-3xl">
      <header className="sticky top-0 z-10 px-4 pt-4 pb-3">
        <div className={cn('rounded-2xl px-4 py-3.5', panelClass)}>
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"> 
                <span className="uppercase tracking-wide">{modeLabel}</span>
              </div>
              <h1
                className={`${bricolage.className} mt-1 truncate text-lg font-semibold leading-tight tracking-tight sm:text-xl uppercase`}
                title={title}
              >
                {title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Question{' '}
                <span className="font-medium tabular-nums text-foreground">{currentIdx + 1}</span>
                <span className="text-muted-foreground/70"> / {questions.length}</span>
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Progress</p>
              <p className={`${bricolage.className} text-lg font-semibold tabular-nums`}>{progressPct}%</p>
            </div>
          </div>

          <div className="mt-3.5 flex gap-1" aria-label={`Question progress: ${currentIdx + 1} of ${questions.length}`}>
            {questions.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'h-1.5 min-w-0 flex-1 rounded-full transition-colors duration-300',
                  segmentTone({
                    index,
                    currentIdx,
                    checked,
                    answer: answers[index],
                    correctIndex: correctIndices[index],
                  }),
                  index === currentIdx && 'ring-1 ring-primary/25 ring-offset-1 ring-offset-[#FCFCFC] dark:ring-offset-[#1C1C1C]'
                )}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-5 pb-24">
        {currentQuestion && (
          <McqQuestion
            question={currentQuestion}
            selectedIndex={answers[currentIdx]}
            onSelect={(idx) => {
              if (checked) return;
              setAnswers((prev) => {
                const next = [...prev];
                next[currentIdx] = idx;
                if (isPlacement) persistPlacement(next, currentIdx);
                return next;
              });
            }}
            disabled={busy || checked}
            showResult={checked}
            correctIndex={correctIndices[currentIdx]}
            shake={shake}
          />
        )}
      </main>

      <div className="fixed bottom-5 left-0 right-0 z-40 bg-transparent px-2.5 sm:px-4">
        <div className="mx-auto flex w-full max-w-xl items-center gap-1.5 overflow-hidden rounded-4xl border border-black/8 bg-white/72 p-1.5 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-black/65 md:rounded-full">
          <Button
            type="button"
            variant="destructive"
            size="pill"
            onClick={handleClearSelection}
            disabled={checked || answers[currentIdx] == null || busy}
            className="w-[5.25rem] shrink-0 px-0"
          >
            Clear
          </Button>
          <Button
            variant="pillPrimary"
            size="pill"
            className="min-w-0 flex-1"
            disabled={checked ? busy : answers[currentIdx] == null || busy}
            onClick={() => {
              if (checked) {
                if (isLast) {
                  isPlacement ? finishPlacement() : finishPractice();
                } else {
                  goToNext();
                }
                return;
              }
              handleCheck();
            }}
          >
            {!checked && checkAnswer.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Checking…
              </>
            ) : !checked ? (
              'Check'
            ) : busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Scoring…
              </>
            ) : isLast ? (
              'Finish'
            ) : (
              'Continue'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
