'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { bricolage } from '@/lib/fonts';
import {
  useRefreshWritingPromptMutation,
  useSubmitWritingMutation,
  useWritingExampleMutation,
  useWritingPromptQuery,
  useWritingProfileQuery,
} from '@/modules/writing/hooks/use-writing-queries';
import type { WritingExampleResponse } from '@/modules/writing/types/writing';
import { useWritingStore } from '@/store/writingStore';

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function WritingView() {
  const router = useRouter();
  const setLastResult = useWritingStore((s) => s.setLastResult);
  const { data: profile, isLoading: profileLoading } = useWritingProfileQuery();
  const {
    data: promptData,
    isLoading: promptLoading,
    isError: promptError,
    refetch,
  } = useWritingPromptQuery(undefined, Boolean(profile?.level));

  const submit = useSubmitWritingMutation();
  const example = useWritingExampleMutation();
  const refreshPrompt = useRefreshWritingPromptMutation();

  const [text, setText] = useState('');
  const [exampleData, setExampleData] = useState<WritingExampleResponse | null>(null);
  const [showExample, setShowExample] = useState(false);

  const wordCount = useMemo(() => countWords(text), [text]);
  const prompt = promptData?.prompt;
  const minWords = prompt?.minWords ?? 0;
  const maxWords = prompt?.maxWords ?? 9999;
  const wordCountOk = wordCount >= minWords && wordCount <= maxWords;

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast.error('Write your answer before submitting.');
      return;
    }
    try {
      const result = await submit.mutateAsync(text.trim());
      setLastResult(result);
      router.push('/learn/writing/results');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Submission failed');
    }
  };

  const handleExample = async () => {
    if (showExample && exampleData) {
      setShowExample(false);
      return;
    }
    try {
      const data = await example.mutateAsync();
      setExampleData(data);
      setShowExample(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not load example');
    }
  };

  const handleNewPrompt = async () => {
    try {
      await refreshPrompt.mutateAsync(undefined);
      await refetch();
      setText('');
      setExampleData(null);
      setShowExample(false);
      toast.success('New prompt ready');
    } catch {
      toast.error('Could not refresh prompt');
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-dvh bg-background px-4 py-10">
        <div className="mx-auto max-w-3xl space-y-4">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!profile?.level) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 text-center">
        <p className={`${bricolage.className} text-2xl font-semibold text-foreground`}>
          Complete reading placement first
        </p>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Writing practice uses your CEFR level from the reading placement test.
        </p>
        <button
          type="button"
          onClick={() => router.push('/learn')}
          className="mt-8 inline-flex h-11 items-center rounded-full bg-foreground px-7 text-sm font-medium text-background hover:opacity-90"
        >
          Back to Learn
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-20 sm:px-6 md:pt-24">
        <div className="mb-8 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push('/learn')}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Learn
          </button>
          <span className="rounded-full bg-foreground/5 px-3 py-1 text-xs font-medium text-muted-foreground">
            Level {profile.level}
          </span>
        </div>

        <header className="mb-8">
          <h1 className={`${bricolage.className} text-3xl font-semibold tracking-tight sm:text-4xl`}>
            Writing practice
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            TCF-style expression écrite — write in French, then get scored on four criteria.
          </p>
        </header>

        {promptLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-56 rounded-2xl" />
          </div>
        ) : promptError || !prompt ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
            Could not load writing prompt.{' '}
            <button type="button" className="underline" onClick={() => refetch()}>
              Try again
            </button>
          </div>
        ) : (
          <>
            <article className="rounded-2xl border border-border/70 bg-card p-6 shadow-[0_2px_16px_rgba(15,23,42,0.04)]">
              <div className="mb-4 flex items-start gap-3">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
                  <BookOpen className="h-5 w-5" strokeWidth={2} />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {prompt.taskType} · {prompt.register}
                  </p>
                  <h2 className={`${bricolage.className} mt-1 text-xl font-semibold`}>{prompt.title}</h2>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{prompt.instructions}</p>
              <div className="mt-4 rounded-xl bg-muted p-4 text-sm leading-relaxed text-foreground">
                {prompt.prompt}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Target length: {prompt.minWords}–{prompt.maxWords} words
              </p>
            </article>

            {showExample && exampleData && (
              <article className="mt-5 rounded-2xl border border-amber-200/80 bg-amber-50/50 p-6">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-amber-900">
                  <Sparkles className="h-4 w-4" />
                  Example answer ({exampleData.wordCount} words)
                </div>
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {exampleData.exampleAnswer}
                </div>
                {exampleData.notes && (
                  <p className="mt-4 border-t border-amber-200/60 pt-3 text-xs leading-relaxed text-muted-foreground">
                    {exampleData.notes}
                  </p>
                )}
              </article>
            )}

            <div className="mt-6">
              <label htmlFor="writing-answer" className="text-sm font-medium text-foreground">
                Your answer (French)
              </label>
              <textarea
                id="writing-answer"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Rédigez votre réponse ici…"
                rows={12}
                className="mt-2 w-full resize-y rounded-2xl border border-border bg-card px-4 py-3 text-sm leading-relaxed text-foreground shadow-sm outline-none ring-foreground/10 placeholder:text-muted-foreground focus:ring-2"
              />
              <div className="mt-2 flex items-center justify-between text-xs">
                <span
                  className={
                    wordCountOk
                      ? 'text-muted-foreground'
                      : wordCount < minWords
                        ? 'text-amber-700'
                        : 'text-red-600'
                  }
                >
                  {wordCount} words
                  {!wordCountOk && ` (target ${minWords}–${maxWords})`}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submit.isPending || !text.trim()}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-foreground px-7 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50 sm:min-w-[180px] sm:flex-none"
              >
                {submit.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Evaluating…
                  </>
                ) : (
                  'Submit for evaluation'
                )}
              </button>
              <button
                type="button"
                onClick={handleExample}
                disabled={example.isPending}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-7 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50 sm:min-w-[180px] sm:flex-none"
              >
                {example.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {showExample ? 'Hide example' : 'See example answer'}
              </button>
              <button
                type="button"
                onClick={handleNewPrompt}
                disabled={refreshPrompt.isPending || promptLoading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border px-5 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                <RefreshCw className="h-4 w-4" />
                New prompt
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
