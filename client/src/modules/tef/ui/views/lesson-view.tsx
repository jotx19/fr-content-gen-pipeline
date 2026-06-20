'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  clearPlacementProgress,
  loadPlacementProgress,
  savePlacementProgress,
} from '@/lib/tef-session-storage';
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
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not check answer');
    }
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
    () => (isPlacement ? 'Placement test' : topic ? `Practice · ${topic}` : 'Practice'),
    [isPlacement, topic]
  );

  if (loading || (mode === 'practice' && practiceQuery.isLoading)) {
    return (
      <div className="lesson-shell items-center justify-center gap-4 px-4 py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <Skeleton className="h-4 w-48" />
      </div>
    );
  }

  return (
    <div className="lesson-shell">
      <header className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{title}</p>
            <p className="text-sm font-extrabold">
              Question {currentIdx + 1} / {questions.length}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => router.push('/learn')} aria-label="Exit">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Progress value={progressPct} className="mt-3 h-3" />
      </header>

      <main className="flex-1 px-4 py-6 pb-28">
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

      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 p-4 backdrop-blur">
        <div className="mx-auto max-w-lg">
          {!checked ? (
            <Button
              size="lg"
              className="w-full uppercase tracking-wide"
              disabled={answers[currentIdx] == null || busy}
              onClick={handleCheck}
            >
              {checkAnswer.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Checking…
                </>
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
                if (isLast) {
                  isPlacement ? finishPlacement() : finishPractice();
                } else {
                  goToNext();
                }
              }}
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Scoring…
                </>
              ) : isLast ? (
                'Finish'
              ) : (
                'Continue'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
