'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, ClipboardList, Loader2 } from '@/components/icons';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { bricolage } from '@/lib/fonts';
import { useI18n } from '@/lib/i18n';
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
import type { PublicQuestion, PublicReadingModule } from '@/modules/tef/types/tef';
import { useLessonStore } from '@/store/lessonStore';

const panelClass = 'bg-[#FCFCFC] dark:bg-[#1C1C1C]';

type FlatItem = {
  question: PublicQuestion;
  moduleIndex: number;
  itemIndexInModule: number;
};

function modulesFromBatch(
  modules: PublicReadingModule[] | undefined,
  questions: PublicQuestion[],
  defaultTitle: string
): PublicReadingModule[] {
  if (modules?.length) return modules;
  if (!questions.length) return [];
  return [
    {
      id: 'mod-legacy',
      type: 'mcq_set',
      title: defaultTitle,
      items: questions,
    },
  ];
}

function flattenModules(modules: PublicReadingModule[]): FlatItem[] {
  const flat: FlatItem[] = [];
  modules.forEach((mod, moduleIndex) => {
    (mod.items ?? []).forEach((question, itemIndexInModule) => {
      flat.push({ question, moduleIndex, itemIndexInModule });
    });
  });
  return flat;
}

function moduleSegmentTone({
  moduleIndex,
  currentModuleIndex,
  itemStart,
  itemEnd,
  currentIdx,
  checked,
  answers,
  correctIndices,
}: {
  moduleIndex: number;
  currentModuleIndex: number;
  itemStart: number;
  itemEnd: number;
  currentIdx: number;
  checked: boolean;
  answers: (number | null)[];
  correctIndices: (number | null)[];
}) {
  if (moduleIndex > currentModuleIndex) return 'bg-black/8 dark:bg-white/10';

  const finished =
    moduleIndex < currentModuleIndex ||
    (moduleIndex === currentModuleIndex && checked && currentIdx === itemEnd - 1);

  if (finished || moduleIndex < currentModuleIndex) {
    let anyWrong = false;
    let anyAnswered = false;
    for (let i = itemStart; i < itemEnd; i++) {
      if (correctIndices[i] != null && answers[i] != null) {
        anyAnswered = true;
        if (answers[i] !== correctIndices[i]) anyWrong = true;
      }
    }
    if (!anyAnswered) return 'bg-primary/70';
    return anyWrong ? 'bg-destructive/80' : 'bg-primary';
  }

  // Current module in progress
  if (checked && correctIndices[currentIdx] != null && answers[currentIdx] != null) {
    return answers[currentIdx] === correctIndices[currentIdx]
      ? 'bg-primary'
      : 'bg-destructive/80';
  }
  return 'bg-primary/45';
}

export function LessonView() {
  const router = useRouter();
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const mode = (searchParams.get('mode') as 'placement' | 'practice') || 'practice';
  const isFresh = searchParams.get('fresh') === '1';

  const setLastDiagnostic = useLessonStore((s) => s.setLastDiagnostic);
  const startOnboard = useStartOnboardMutation();
  const submitOnboard = useSubmitOnboardMutation();
  const submitPractice = useSubmitPracticeMutation();
  const checkAnswer = useCheckAnswerMutation();

  const practiceQuery = usePracticeQuery(mode === 'practice');

  const [modules, setModules] = useState<PublicReadingModule[]>([]);
  const [topic, setTopic] = useState<string | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [correctIndices, setCorrectIndices] = useState<(number | null)[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [checked, setChecked] = useState(false);
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(true);

  const placementInitRef = useRef(false);
  const practiceInitRef = useRef(false);

  const flatItems = useMemo(() => flattenModules(modules), [modules]);
  const questions = useMemo(() => flatItems.map((f) => f.question), [flatItems]);

  const moduleRanges = useMemo(() => {
    let cursor = 0;
    return modules.map((mod) => {
      const start = cursor;
      const end = cursor + (mod.items?.length ?? 0);
      cursor = end;
      return { start, end };
    });
  }, [modules]);

  useEffect(() => {
    placementInitRef.current = false;
    practiceInitRef.current = false;
    setModules([]);
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
          const mods = modulesFromBatch(undefined, saved.questions, t('lesson.practice'));
          setModules(mods);
          setAnswers(saved.answers ?? new Array(saved.questions.length).fill(null));
          setCorrectIndices(new Array(saved.questions.length).fill(null));
          setCurrentIdx(saved.currentIdx ?? 0);
          return;
        }

        clearPlacementProgress();
        const data = await startOnboard.mutateAsync();
        if (cancelled) return;
        if (!data.questions?.length) throw new Error(t('lesson.noQuestions'));

        const mods = modulesFromBatch(undefined, data.questions, t('lesson.practice'));
        setModules(mods);
        setAnswers(new Array(data.questions.length).fill(null));
        setCorrectIndices(new Array(data.questions.length).fill(null));
        setCurrentIdx(0);
        savePlacementProgress({ questions: data.questions, answers: [], currentIdx: 0 });
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : t('lesson.loadPlacementFailed'));
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
      toast.error(t('lesson.loadPracticeFailed'));
      router.replace('/learn');
      return;
    }

    if (!practiceQuery.isSuccess) return;
    const data = practiceQuery.data;
    const mods = modulesFromBatch(data.modules, data.questions ?? [], t('lesson.practice'));
    if (!mods.length) return;

    practiceInitRef.current = true;
    const flat = flattenModules(mods);
    setModules(mods);
    setTopic(data.topic ?? null);
    setAnswers(new Array(flat.length).fill(null));
    setCorrectIndices(new Array(flat.length).fill(null));
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
      toast.error(err instanceof Error ? err.message : t('lesson.checkFailed'));
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
      toast.error(err instanceof Error ? err.message : t('lesson.submitFailed'));
    }
  };

  const finishPractice = async () => {
    if (answers.some((a) => a == null)) return;
    try {
      const data = await submitPractice.mutateAsync(answers as number[]);
      setLastDiagnostic(data);
      router.push('/learn/results');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('lesson.submitFailed'));
    }
  };

  const isPlacement = mode === 'placement';
  const isLast = questions.length > 0 && currentIdx === questions.length - 1;
  const currentFlat = flatItems[currentIdx];
  const currentModule =
    currentFlat != null ? modules[currentFlat.moduleIndex] : undefined;
  const currentModuleIndex = currentFlat?.moduleIndex ?? 0;
  const itemsInModule = currentModule?.items?.length ?? 0;
  const itemInModule = (currentFlat?.itemIndexInModule ?? 0) + 1;

  const completedModules = modules.reduce((acc, _, mi) => {
    const range = moduleRanges[mi];
    if (!range) return acc;
    if (mi < currentModuleIndex) return acc + 1;
    if (mi === currentModuleIndex && checked && currentIdx === range.end - 1) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const progressPct = modules.length
    ? Math.round(
        ((completedModules +
          (currentModule && !isLast
            ? (itemInModule - (checked ? 0 : 1)) / Math.max(itemsInModule, 1)
            : 0)) /
          modules.length) *
          100
      )
    : 0;

  const busy =
    submitOnboard.isPending || submitPractice.isPending || checkAnswer.isPending;
  const currentQuestion = questions[currentIdx];

  const title = useMemo(
    () =>
      isPlacement
        ? t('lesson.placementTest')
        : topic
          ? topic
          : t('lesson.tefReading'),
    [isPlacement, topic, t]
  );

  const modeLabel = isPlacement ? t('lesson.placement') : t('lesson.practice');
  const ModeIcon = isPlacement ? ClipboardList : BookOpen;

  if (loading || (mode === 'practice' && practiceQuery.isLoading)) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col items-center justify-center gap-4 px-4 py-20 sm:max-w-3xl">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <Skeleton className={cn('h-4 w-48 rounded-md', panelClass)} />
      </div>
    );
  }

  const renderStatusLine = () =>
    isPlacement ? (
      <>
        Question{' '}
        <span className="font-medium tabular-nums text-foreground">{currentIdx + 1}</span>
        <span className="text-muted-foreground/70"> / {questions.length}</span>
      </>
    ) : (
      <>
        {currentModule?.sectionCode ? (
          <span className="font-medium text-foreground">
            Section {currentModule.sectionCode}
          </span>
        ) : (
          <>
            Module{' '}
            <span className="font-medium tabular-nums text-foreground">
              {currentModuleIndex + 1}
            </span>
          </>
        )}
        <span className="text-muted-foreground/70"> / {modules.length}</span>
        {currentModule?.sectionTitle || currentModule?.title ? (
          <span className="text-muted-foreground/70">
            {' '}
            · {currentModule.sectionTitle ?? currentModule.title}
          </span>
        ) : null}
        {itemsInModule > 1 ? (
          <span className="text-muted-foreground/70">
            {' '}
            · {itemInModule}/{itemsInModule}
          </span>
        ) : null}
      </>
    );

  const passageLabel = () => {
    if (!currentModule) return t('lesson.passage');
    const type = currentModule.type;
    if (type === 'statement_graph') return t('lesson.chart');
    if (type === 'doc_info_match' || type === 'finding_info') return t('lesson.document');
    if (type === 'sentence_gap') return t('lesson.passage');
    if (type === 'text_gap' || type === 'press_article' || type === 'admin_documents') {
      return t('lesson.passage');
    }
    return t('lesson.passage');
  };

  const renderProgressSegments = () => (
    <div
      className="flex gap-1"
      aria-label={
        isPlacement
          ? t('lesson.questionProgress', { current: currentIdx + 1, total: questions.length })
          : t('lesson.moduleProgress', { current: currentModuleIndex + 1, total: modules.length })
      }
    >
      {(isPlacement ? questions : modules).map((_, index) => {
        if (isPlacement) {
          return (
            <div
              key={index}
              className={cn(
                'h-1.5 min-w-0 flex-1 rounded-full transition-colors duration-300',
                index > currentIdx && 'bg-black/8 dark:bg-white/10',
                index < currentIdx &&
                  (correctIndices[index] != null && answers[index] != null
                    ? answers[index] === correctIndices[index]
                      ? 'bg-primary'
                      : 'bg-destructive/80'
                    : 'bg-primary/70'),
                index === currentIdx &&
                  (checked && correctIndices[index] != null && answers[index] != null
                    ? answers[index] === correctIndices[index]
                      ? 'bg-primary'
                      : 'bg-destructive/80'
                    : 'bg-primary/45'),
                index === currentIdx &&
                  'ring-1 ring-primary/25 ring-offset-1 ring-offset-[#FCFCFC] dark:ring-offset-[#1C1C1C]',
              )}
            />
          );
        }

        const range = moduleRanges[index]!;
        return (
          <div
            key={modules[index]?.id ?? index}
            className={cn(
              'h-1.5 min-w-0 flex-1 rounded-full transition-colors duration-300',
              moduleSegmentTone({
                moduleIndex: index,
                currentModuleIndex,
                itemStart: range.start,
                itemEnd: range.end,
                currentIdx,
                checked,
                answers,
                correctIndices,
              }),
              index === currentModuleIndex &&
                'ring-1 ring-primary/25 ring-offset-1 ring-offset-[#FCFCFC] dark:ring-offset-[#1C1C1C]',
            )}
            title={modules[index]?.sectionTitle ?? modules[index]?.title}
          />
        );
      })}
    </div>
  );

  const hideScrollbar =
    '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

  return (
    <div className="relative flex h-dvh w-full overflow-hidden">
      <aside className="pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-[min(22rem,28vw)] items-start p-5 lg:flex xl:w-[min(24rem,24vw)]">
        <div
          className={cn(
            'pointer-events-auto flex aspect-square w-full max-w-[20rem] flex-col justify-between rounded-[1.75rem] p-5 xl:max-w-[22rem] xl:p-6',
            panelClass,
          )}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <ModeIcon className="h-3.5 w-3.5" strokeWidth={2} />
              <span className="uppercase tracking-wide">{modeLabel}</span>
            </div>
            <h1
              className={`${bricolage.className} mt-2 text-xl font-semibold leading-tight tracking-tight uppercase xl:text-2xl`}
              title={title}
            >
              {title}
            </h1>
            <p className="mt-3 text-sm leading-snug text-muted-foreground">{renderStatusLine()}</p>
          </div>

          <div>
            <div className="mb-3 flex items-end justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('lesson.progress')}
              </p>
              <p className={`${bricolage.className} text-2xl font-semibold tabular-nums`}>
                {Math.min(100, Math.max(0, progressPct))}%
              </p>
            </div>
            {renderProgressSegments()}
          </div>
        </div>
      </aside>

      {/* Scrollable lesson column — centered, no scrollbar */}
      <div
        className={cn(
          'flex h-full min-h-0 w-full flex-1 flex-col overflow-y-auto',
          hideScrollbar,
        )}
      >
        {/* Mobile / tablet header — scrolls with content (not fixed) */}
        <header className="shrink-0 px-4 pt-4 pb-3 lg:hidden">
          <div className={cn('rounded-2xl px-4 py-3.5', panelClass)}>
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <ModeIcon className="h-3.5 w-3.5" strokeWidth={2} />
                  <span className="uppercase tracking-wide">{modeLabel}</span>
                </div>
                <h1
                  className={`${bricolage.className} mt-1 text-sm font-semibold leading-snug tracking-tight sm:text-base uppercase`}
                  title={title}
                >
                  {title}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">{renderStatusLine()}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t('lesson.progress')}
                </p>
                <p className={`${bricolage.className} text-lg font-semibold tabular-nums`}>
                  {Math.min(100, Math.max(0, progressPct))}%
                </p>
              </div>
            </div>
            <div className="mt-3.5">{renderProgressSegments()}</div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-2xl flex-1 space-y-4 px-4 py-5 pb-28 sm:max-w-3xl">
          {!isPlacement && currentModule?.passage ? (
            <article
              className={cn(
                'rounded-2xl px-5 py-4 text-[15px] leading-relaxed whitespace-pre-wrap text-neutral-800 dark:text-white/85',
                panelClass,
              )}
            >
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-foreground/50">
                {passageLabel()}
              </p>
              {currentModule.passage}
            </article>
          ) : null}

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
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 px-2.5 sm:px-4">
        <div className="pointer-events-auto mx-auto flex w-full max-w-xl items-center gap-1.5 overflow-hidden rounded-4xl border border-black/8 bg-white/72 p-1.5 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-black/65 md:rounded-full">
          <Button
            type="button"
            variant="destructive"
            size="pill"
            onClick={handleClearSelection}
            disabled={checked || answers[currentIdx] == null || busy}
            className="w-[5.25rem] shrink-0 px-0"
          >
            {t('common.clear')}
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
              t('common.check')
            ) : busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Scoring…
              </>
            ) : isLast ? (
              t('common.finish')
            ) : (
              t('common.continue')
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
