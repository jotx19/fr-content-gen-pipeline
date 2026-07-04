'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronDown, Copy, Info, Loader2, RefreshCw, Trash2 } from '@/components/icons';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { bricolage } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import {
  useRefreshWritingPromptMutation,
  useSubmitWritingMutation,
  useWritingExampleMutation,
  useWritingPromptQuery,
  useWritingProfileQuery,
} from '@/modules/writing/hooks/use-writing-queries';
import type { WritingExampleResponse } from '@/modules/writing/types/writing';
import {
  TEF_WRITING_SECTIONS,
  sectionMetaForPrompt,
  type TefWritingSectionKey,
} from '@/modules/writing/config/tef-sections';
import { WritingAiTyping } from '@/modules/writing/ui/components/writing-ai-typing';
import {
  BlankListFallback,
  FillBlankAnswer,
  SentenceAnswer,
} from '@/modules/writing/ui/components/writing-answer-fields';
import type { WritingSubmitPayload } from '@/modules/writing/types/writing';
import { useWritingStore } from '@/store/writingStore';

const surfaceClass = 'bg-white/80 backdrop-blur-md dark:bg-white/10';

const toolbarIcon =
  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-foreground/55 transition-[color,background-color] duration-150 hover:bg-white/70 hover:text-foreground disabled:pointer-events-none disabled:opacity-35 dark:text-white/55 dark:hover:bg-white/15';

const toolbarIconActive =
  'bg-white/70 text-foreground dark:bg-white/15 dark:text-foreground';

const levelBadgeClass =
  'rounded-full border-white/60 bg-white/70 px-3 py-1 text-xs font-semibold tabular-nums text-foreground dark:border-white/15 dark:bg-white/10 dark:text-white';

const xpBadgeClass =
  'rounded-full border-[#C9A227]/30 bg-[#C9A227]/10 px-3 py-1 text-xs font-semibold tabular-nums text-[#A8860D] dark:border-[#A8860D]/40 dark:bg-[#A8860D]/15 dark:text-[#C9A227]';

function FooterSeparator() {
  return <div className="h-4 w-px shrink-0 bg-white/50 dark:bg-white/20" aria-hidden />;
}

function ToolbarIconButton({
  label,
  onClick,
  disabled,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          className={cn(toolbarIcon, active && toolbarIconActive)}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

const writingSections: TefWritingSectionKey[] = ['A', 'B'];

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
  const [blankAnswers, setBlankAnswers] = useState<Record<string, string>>({});
  const [sentenceAnswers, setSentenceAnswers] = useState<Record<string, string>>({});
  const [promptRefreshing, setPromptRefreshing] = useState(false);
  const [pendingSection, setPendingSection] = useState<TefWritingSectionKey | null>(null);
  const [exampleData, setExampleData] = useState<WritingExampleResponse | null>(null);
  const [showExample, setShowExample] = useState(false);
  const [exampleTypedText, setExampleTypedText] = useState('');
  const [exampleTypingDone, setExampleTypingDone] = useState(false);
  const [exampleSession, setExampleSession] = useState(0);
  const [questionOpen, setQuestionOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [exampleCopied, setExampleCopied] = useState(false);
  const copyResetRef = useRef<number | undefined>(undefined);
  const exampleCopyResetRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (copyResetRef.current !== undefined) window.clearTimeout(copyResetRef.current);
      if (exampleCopyResetRef.current !== undefined) window.clearTimeout(exampleCopyResetRef.current);
    };
  }, []);

  const wordCount = useMemo(() => {
    if (showExample) {
      if (!exampleTypedText.trim()) return 0;
      return countWords(exampleTypedText);
    }
    return countWords(text);
  }, [text, showExample, exampleTypedText]);
  const prompt = promptData?.prompt;
  const taskMode = prompt?.taskMode ?? profile?.taskMode ?? 'full';

  useEffect(() => {
    if (!prompt?.id) return;
    setBlankAnswers({});
    setSentenceAnswers({});
    setText('');
    setExampleData(null);
    setExampleTypedText('');
    setExampleTypingDone(false);
    setShowExample(false);
  }, [prompt?.id]);

  const sectionMeta = prompt ? sectionMetaForPrompt(prompt) : null;
  const minWords = prompt?.minWords ?? 0;
  const maxWords = prompt?.maxWords ?? 9999;
  const writingLevel = profile?.writingLevel ?? profile?.level ?? '?';
  const writingXp = profile?.writingXp ?? 0;
  const wordCountOk = taskMode === 'full' ? wordCount >= minWords && wordCount <= maxWords : true;
  const currentSection = sectionMeta?.key ?? 'A';
  const displaySectionLabel = pendingSection
    ? TEF_WRITING_SECTIONS[pendingSection].label
    : (sectionMeta?.label ?? 'Section A');
  const questionLoading = promptRefreshing || refreshPrompt.isPending;

  const canSubmit = useMemo(() => {
    if (showExample) return false;
    if (taskMode === 'fill_blanks') {
      const ids = prompt?.blanks?.map((b) => b.id) ?? [];
      return ids.length > 0 && ids.every((id) => (blankAnswers[id] ?? '').trim());
    }
    if (taskMode === 'sentences') {
      const rows = prompt?.sentencePrompts ?? [];
      return (
        rows.length > 0 &&
        rows.every((row) => {
          const words = (sentenceAnswers[row.id] ?? '').trim().split(/\s+/).filter(Boolean).length;
          return words >= row.minWords && words <= row.maxWords;
        })
      );
    }
    return text.trim().length >= 10 && wordCountOk;
  }, [
    showExample,
    taskMode,
    prompt?.blanks,
    prompt?.sentencePrompts,
    blankAnswers,
    sentenceAnswers,
    text,
    wordCountOk,
  ]);

  const handleSubmit = async () => {
    let payload: WritingSubmitPayload;
    if (taskMode === 'fill_blanks') {
      payload = { blanks: blankAnswers };
    } else if (taskMode === 'sentences') {
      payload = { sentences: sentenceAnswers };
    } else {
      if (!text.trim()) {
        toast.error('Write your answer before submitting.');
        return;
      }
      payload = { text: text.trim() };
    }

    try {
      const result = await submit.mutateAsync(payload);
      setLastResult(result);
      router.push('/learn/writing/results');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Submission failed');
    }
  };

  const handleExample = async () => {
    if (showExample) {
      setShowExample(false);
      setExampleTypedText('');
      setExampleTypingDone(false);
      if (taskMode === 'fill_blanks') setBlankAnswers({});
      return;
    }

    setShowExample(true);
    setExampleTypedText('');
    setExampleTypingDone(false);
    setExampleSession((n) => n + 1);

    const showExampleNotes = (notes: string | null | undefined) => {
      if (taskMode === 'fill_blanks' && notes?.trim()) {
        toast.message(notes.trim(), { duration: 6000 });
      }
    };

    if (exampleData?.blankAnswers && Object.keys(exampleData.blankAnswers).length > 0) {
      setBlankAnswers(exampleData.blankAnswers);
      showExampleNotes(exampleData.notes);
      return;
    }

    try {
      const data = await example.mutateAsync();
      setExampleData(data);
      if (data.blankAnswers && Object.keys(data.blankAnswers).length > 0) {
        setBlankAnswers(data.blankAnswers);
      }
      showExampleNotes(data.notes);
    } catch (err) {
      setShowExample(false);
      toast.error(err instanceof Error ? err.message : 'Could not load example');
    }
  };

  const handleExampleTypingDone = () => {
    setExampleTypingDone(true);
  };

  const handleClearAnswer = () => {
    setText('');
    setBlankAnswers({});
    setSentenceAnswers({});
    setCopied(false);
  };

  const handleCopyAnswer = async () => {
    if (!text.trim()) {
      toast.error('Nothing to copy yet.');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (copyResetRef.current !== undefined) window.clearTimeout(copyResetRef.current);
      copyResetRef.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  const handleCopyExample = async () => {
    const toCopy = (exampleData?.exampleAnswer ?? exampleTypedText).trim();
    if (!toCopy) {
      toast.error('Nothing to copy yet.');
      return;
    }
    try {
      await navigator.clipboard.writeText(toCopy);
      setExampleCopied(true);
      if (exampleCopyResetRef.current !== undefined) window.clearTimeout(exampleCopyResetRef.current);
      exampleCopyResetRef.current = window.setTimeout(() => setExampleCopied(false), 2000);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  const handleNewPrompt = async (section?: 'A' | 'B') => {
    setPromptRefreshing(true);
    if (section) setPendingSection(section);
    try {
      await refreshPrompt.mutateAsync(section ? { section } : undefined);
      setQuestionOpen(true);
      toast.success(section ? `Section ${section} prompt ready` : 'New prompt ready');
    } catch {
      toast.error('Could not refresh prompt');
    } finally {
      setPromptRefreshing(false);
      setPendingSection(null);
    }
  };

  if (profileLoading) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-4">
          <Skeleton className={cn('h-24 w-full rounded-2xl', surfaceClass)} />
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!profile?.level) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
        <p className={`${bricolage.className} text-2xl font-semibold text-foreground`}>
          Complete reading placement first
        </p>
        <p className="mt-2 max-w-sm text-sm text-foreground/55">
          Writing practice unlocks after reading placement. Writing level and XP are tracked separately.
        </p>
        <Button type="button" onClick={() => router.push('/learn')} className="mt-8 rounded-full">
          Back to Learn
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6">
        {promptLoading ? (
          <div className="space-y-4">
            <Skeleton className={cn('h-24 w-full rounded-2xl', surfaceClass)} />
            <Skeleton className={cn('h-56 w-full rounded-2xl border border-dashed border-white/60 dark:border-white/15', surfaceClass)} />
          </div>
        ) : promptError || !prompt ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
            Could not load writing prompt.{' '}
            <button type="button" className="underline" onClick={() => refetch()}>
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-1.5">
              {taskMode === 'full' ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      disabled={questionLoading}
                      className="group inline-flex items-center gap-1.5 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50 data-[state=open]:[&_svg]:rotate-180"
                      aria-label="Switch writing section"
                    >
                      <h2 className={`${bricolage.className} text-xl font-semibold tracking-tight sm:text-2xl`}>
                        {displaySectionLabel}
                      </h2>
                      <ChevronDown className="h-4 w-4 shrink-0 text-foreground/55 transition-transform duration-200" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-[8.5rem] p-1">
                    {writingSections.map((key) => (
                      <DropdownMenuItem
                        key={key}
                        disabled={questionLoading}
                        onClick={() => {
                          if (key !== currentSection) handleNewPrompt(key);
                        }}
                        className="cursor-pointer px-3 py-2 text-sm font-medium"
                      >
                        {TEF_WRITING_SECTIONS[key].label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <h2 className={`${bricolage.className} text-xl font-semibold tracking-tight sm:text-2xl`}>
                  {taskMode === 'fill_blanks' ? 'Fill in the blanks' : 'Write sentences'}
                </h2>
              )}

              {taskMode === 'full' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-foreground/55 transition-colors hover:text-foreground"
                    aria-label="Section information"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  align="start"
                  className="max-w-[260px] text-left text-xs leading-relaxed"
                >
                  <p>{sectionMeta?.description}</p>
                  <p className="mt-1.5 text-background/75">
                    {sectionMeta?.label ?? 'Section A'}{' '}
                    <span className="text-background/50">|</span> {prompt.minWords}–{prompt.maxWords}{' '}
                    words
                  </p>
                </TooltipContent>
              </Tooltip>
              )}
            </div>

            {/* Header + question — full navbar width */}
            <div className={cn('w-full overflow-hidden rounded-2xl', surfaceClass)}>
              <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 py-4">
                <h1 className={`${bricolage.className} text-xl font-semibold tracking-tight sm:text-2xl`}>
                  Writing
                </h1>

                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-white/50 px-2 py-1 text-[11px] tabular-nums text-foreground/45 backdrop-blur-sm dark:bg-white/[0.06] dark:text-white/45">
                    <span className="font-medium text-foreground/65 dark:text-white/65">{writingLevel}</span>
                    <span className="text-foreground/20 dark:text-white/20" aria-hidden>|</span>
                    <span>
                      <span className="font-medium text-foreground/65 dark:text-white/65">{writingXp}</span>
                      <span className="ml-0.5 font-normal">xp</span>
                    </span>
                  </span>

                  <Badge
                    asChild
                    variant="purple"
                    className={cn(showExample && 'ring-2 ring-[#7130FF]/25')}
                  >
                    <button
                      type="button"
                      onClick={handleExample}
                      disabled={example.isPending}
                      className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {example.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : null}
                      {showExample ? 'Hide example' : 'Generate with AI'}
                    </button>
                  </Badge>
                </div>
              </header>

              <div className="px-5 pb-4">
                {questionLoading ? (
                  <div className="space-y-3 py-1" aria-busy="true" aria-label="Loading question">
                    <Skeleton className="h-3 w-16 rounded-md bg-white/60 dark:bg-white/10" />
                    <Skeleton className="h-6 w-[88%] rounded-md bg-white/60 dark:bg-white/10 sm:h-7" />
                    <div className="space-y-2 pt-1">
                      <Skeleton className="h-3.5 w-full rounded-md bg-white/60 dark:bg-white/10" />
                      <Skeleton className="h-3.5 w-[94%] rounded-md bg-white/60 dark:bg-white/10" />
                      <Skeleton className="h-3.5 w-[82%] rounded-md bg-white/60 dark:bg-white/10" />
                      <Skeleton className="h-3.5 w-[90%] rounded-md bg-white/60 dark:bg-white/10" />
                    </div>
                  </div>
                ) : (
                  <>
                  <button
                    type="button"
                    onClick={() => setQuestionOpen((open) => !open)}
                    className="flex w-full items-start justify-between gap-3 py-1 text-left"
                    aria-expanded={questionOpen}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-foreground/55">
                        Question
                      </p>
                      <p className={`${bricolage.className} mt-0.5 text-base font-semibold leading-snug sm:text-lg`}>
                        {prompt.title}
                      </p>
                    </div>
                    <ChevronDown
                      className={cn(
                        'mt-1 h-4 w-4 shrink-0 text-foreground/55 transition-transform duration-200',
                        questionOpen && 'rotate-180'
                      )}
                    />
                  </button>

                  {questionOpen && (
                    <div className="mt-3 space-y-3">
                      <p className="text-sm leading-relaxed text-foreground/55">{prompt.instructions}</p>
                      {taskMode === 'fill_blanks' && prompt.prompt && (
                        <div className="rounded-xl bg-white/70 px-4 py-3 text-sm leading-relaxed text-foreground/55 dark:bg-white/10">
                          <p className="text-xs font-medium uppercase tracking-wide text-foreground/50 dark:text-white/50">
                            Situation
                          </p>
                          <p className="mt-1.5 text-foreground">{prompt.prompt}</p>
                        </div>
                      )}
                      {taskMode === 'full' && (
                        <p className="text-sm leading-relaxed text-foreground">{prompt.prompt}</p>
                      )}
                      {taskMode === 'sentences' && prompt.prompt && (
                        <p className="text-sm leading-relaxed text-foreground">{prompt.prompt}</p>
                      )}
                    </div>
                  )}
                  </>
                )}
                </div>
              </div>

            <div className="mt-5 w-full">
              {(taskMode === 'fill_blanks' || taskMode === 'sentences') && (
                <div>
                  <label className="text-sm font-medium text-foreground">
                    {showExample ? 'AI example — your reply' : 'Your reply'}
                  </label>
                  <div
                    className={cn(
                      surfaceClass,
                      'relative mt-2 flex flex-col rounded-2xl border border-dashed border-white/60 dark:border-white/15'
                    )}
                  >
                    {taskMode === 'fill_blanks' &&
                      (prompt.paragraphParts?.length ? (
                        <FillBlankAnswer
                          key={prompt.id}
                          parts={prompt.paragraphParts}
                          blanks={prompt.blanks ?? []}
                          values={blankAnswers}
                          onChange={(id, value) =>
                            setBlankAnswers((prev) => ({ ...prev, [id]: value }))
                          }
                          readOnly={showExample}
                          className="border-0 px-4 py-4"
                        />
                      ) : (
                        <BlankListFallback
                          blanks={prompt.blanks ?? []}
                          values={blankAnswers}
                          onChange={(id, value) =>
                            setBlankAnswers((prev) => ({ ...prev, [id]: value }))
                          }
                          readOnly={showExample}
                        />
                      ))}
                    {taskMode === 'sentences' && prompt.sentencePrompts?.length ? (
                      <SentenceAnswer
                        prompts={prompt.sentencePrompts}
                        values={sentenceAnswers}
                        onChange={(id, value) =>
                          setSentenceAnswers((prev) => ({ ...prev, [id]: value }))
                        }
                        readOnly={showExample}
                        className="px-3 py-3"
                      />
                    ) : null}
                    <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-dashed border-white/50 px-4 py-3 dark:border-white/10">
                      <ToolbarIconButton
                        label="Next task"
                        onClick={() => handleNewPrompt()}
                        disabled={questionLoading || promptLoading}
                      >
                        <RefreshCw
                          className={cn('h-3.5 w-3.5', questionLoading && 'animate-spin')}
                        />
                      </ToolbarIconButton>
                      <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submit.isPending || !canSubmit || showExample}
                        size="sm"
                        className={cn(
                          'h-9 rounded-lg px-4 text-xs font-medium',
                          'bg-foreground text-background hover:bg-foreground/90',
                          'dark:border dark:border-white/12 dark:bg-white dark:text-black dark:hover:bg-white/90'
                        )}
                      >
                        {submit.isPending ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Submitting…
                          </>
                        ) : (
                          'Submit'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {taskMode === 'full' && (
              <div className="mt-6">
                <label htmlFor="writing-answer" className="text-sm font-medium text-foreground">
                  {showExample ? 'AI example (French)' : 'Your answer (French)'}
                </label>
                <div
                  className={cn(
                    surfaceClass,
                    'relative mt-2 flex flex-col rounded-2xl border border-dashed border-white/60 dark:border-white/15'
                  )}
                >
                  {showExample ? (
                    <>
                      {!example.isPending && (exampleData || exampleTypedText.trim()) && (
                        <div className="pointer-events-none absolute right-2 top-2 z-10 flex gap-1.5">
                          {exampleTypingDone && exampleData?.notes && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  className={cn(
                                    toolbarIcon,
                                    'pointer-events-auto border border-white/60 bg-white/80 shadow-sm backdrop-blur-md dark:border-white/15 dark:bg-white/10'
                                  )}
                                  aria-label="Why this example works"
                                >
                                  <Info className="h-3.5 w-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent
                                side="left"
                                align="start"
                                className="max-w-sm text-left text-xs leading-relaxed"
                              >
                                {exampleData.notes}
                              </TooltipContent>
                            </Tooltip>
                          )}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                onClick={handleCopyExample}
                                disabled={!exampleData?.exampleAnswer && !exampleTypedText.trim()}
                                className={cn(
                                  'pointer-events-auto rounded-md border-white/60 shadow-sm dark:border-white/15',
                                  surfaceClass
                                )}
                                aria-label={exampleCopied ? 'Copied' : 'Copy example'}
                              >
                                {exampleCopied ? (
                                  <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              {exampleCopied ? 'Copied' : 'Copy example'}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                      <WritingAiTyping
                        text={exampleData?.exampleAnswer ?? ''}
                        loading={example.isPending || (showExample && !exampleData)}
                        active={showExample}
                        resetKey={exampleSession}
                        onProgress={setExampleTypedText}
                        onTypingDone={handleExampleTypingDone}
                      />
                    </>
                  ) : (
                    <>
                      <div className="pointer-events-none absolute right-2 top-2 z-10 flex gap-1.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={handleClearAnswer}
                              disabled={!text.trim()}
                              className="pointer-events-auto rounded-md border border-red-200/80 bg-red-500/10 text-red-700 shadow-sm hover:bg-red-500/15 hover:text-red-800 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-500 dark:hover:bg-red-500/15 dark:hover:text-red-400"
                              aria-label="Clear answer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            Clear answer
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              onClick={handleCopyAnswer}
                              disabled={!text.trim()}
                              className={cn(
                                'pointer-events-auto rounded-md border-white/60 shadow-sm dark:border-white/15',
                                surfaceClass
                              )}
                              aria-label={copied ? 'Copied' : 'Copy answer'}
                            >
                              {copied ? (
                                <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            {copied ? 'Copied' : 'Copy answer'}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <textarea
                        id="writing-answer"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Rédigez votre réponse ici…"
                        rows={12}
                        className="min-h-[240px] w-full flex-1 resize-y rounded-2xl border-0 bg-transparent px-4 py-3 pr-[4.75rem] text-sm leading-relaxed text-foreground outline-none placeholder:text-foreground/40 dark:placeholder:text-white/40 focus:ring-0"
                      />
                    </>
                  )}
                  <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-dashed border-white/50 px-4 py-3 dark:border-white/10">
                    <span
                      className={cn(
                        'text-xs tabular-nums',
                        showExample
                          ? 'text-foreground/55'
                          : wordCountOk
                            ? 'text-foreground/55'
                            : wordCount < minWords
                              ? 'text-amber-600 dark:text-amber-500'
                              : 'text-red-600 dark:text-red-400'
                      )}
                    >
                      {showExample && example.isPending && 'Generating… '}
                      {showExample && !example.isPending && !exampleTypingDone && 'Writing… '}
                      {wordCount} words
                    </span>
                    <FooterSeparator />
                    <span className="text-xs tabular-nums text-foreground/55">
                      target {minWords}–{maxWords}
                    </span>
                    <FooterSeparator />
                    <ToolbarIconButton
                      label="Next task"
                      onClick={() => handleNewPrompt()}
                      disabled={questionLoading || promptLoading}
                    >
                      <RefreshCw
                        className={cn('h-3.5 w-3.5', questionLoading && 'animate-spin')}
                      />
                    </ToolbarIconButton>
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submit.isPending || !canSubmit || showExample}
                      size="sm"
                      className={cn(
                        'h-9 rounded-lg px-4 text-xs font-medium',
                        'bg-foreground text-background hover:bg-foreground/90',
                        'dark:border dark:border-white/12 dark:bg-white dark:text-black dark:hover:bg-white/90'
                      )}
                    >
                      {submit.isPending ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Evaluating…
                        </>
                      ) : (
                        'Submit for evaluation'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              )}
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
