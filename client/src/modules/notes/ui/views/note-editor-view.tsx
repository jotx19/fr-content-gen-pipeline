'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { Block } from '@blocknote/core';

import { ArrowLeft, Check, Globe, LinkIcon, Loader2, Trash2 } from '@/components/icons';
import { Switch } from '@/components/ui/switch';
import { bricolage, inter } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { NotesEditor } from '@/modules/notes/ui/components/notes-editor';
import {
  useDeleteNoteMutation,
  useNoteQuery,
  useUpdateNoteMutation,
} from '@/modules/notes/hooks/use-notes-queries';
import { useAuthStore } from '@/store/authStore';

export function NoteEditorView() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: note, isLoading, isError } = useNoteQuery(id, Boolean(user && id));
  const updateNote = useUpdateNoteMutation();
  const removeNote = useDeleteNoteMutation();

  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');
  const [linkCopied, setLinkCopied] = useState(false);
  const titleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seeded = useRef(false);

  useEffect(() => {
    if (!note || seeded.current) return;
    setTitle(note.title || 'Untitled');
    setVisibility(note.visibility);
    seeded.current = true;
  }, [note]);

  useEffect(() => {
    seeded.current = false;
  }, [id]);

  const saveTitle = useCallback(
    (next: string) => {
      if (!id) return;
      if (titleTimer.current) clearTimeout(titleTimer.current);
      titleTimer.current = setTimeout(() => {
        updateNote.mutate({ id, title: next || 'Untitled' });
      }, 500);
    },
    [id, updateNote]
  );

  const handleTitleChange = (value: string) => {
    setTitle(value);
    saveTitle(value);
  };

  const handleContentChange = useCallback(
    (content: Block[], excerpt: string) => {
      if (!id) return;
      if (contentTimer.current) clearTimeout(contentTimer.current);
      contentTimer.current = setTimeout(() => {
        updateNote.mutate({ id, content, excerpt });
      }, 700);
    },
    [id, updateNote]
  );

  const handleVisibility = async (isPublic: boolean) => {
    const next = isPublic ? 'public' : 'private';
    setVisibility(next);
    try {
      await updateNote.mutateAsync({ id, visibility: next });
      toast.success(isPublic ? 'Note is public' : 'Note is private');
    } catch (err) {
      setVisibility(isPublic ? 'private' : 'public');
      toast.error(err instanceof Error ? err.message : 'Could not update visibility');
    }
  };

  const handleDelete = async () => {
    try {
      await removeNote.mutateAsync(id);
      toast.success('Note deleted');
      router.push('/notes');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete note');
    }
  };

  const handleCopyPublicLink = async () => {
    const url = `${window.location.origin}/notes/p/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      toast.success('Link copied');
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setLinkCopied(false), 1800);
    } catch {
      toast.error('Could not copy link');
    }
  };

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-black/40 dark:text-white/40" />
      </div>
    );
  }

  if (isError || !note) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
        <p className={cn(inter.className, 'text-sm text-black/60 dark:text-white/60')}>
          Note not found
        </p>
        <Link
          href="/notes"
          className={cn(inter.className, 'text-sm font-medium underline underline-offset-2')}
        >
          Back to notes
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh w-full">
      <header className="sticky top-0 z-20 border-b border-black/8 bg-background/90 px-4 py-3 backdrop-blur-md dark:border-white/8 sm:px-8">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
          <Link
            href="/notes"
            className={cn(
              inter.className,
              'inline-flex items-center gap-1.5 text-sm text-black/60 transition-colors hover:text-black dark:text-white/60 dark:hover:text-white',
            )}
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            Notes
          </Link>

          <div className="flex items-center gap-2">
            {visibility === 'public' ? (
              <button
                type="button"
                onClick={handleCopyPublicLink}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-md text-black/45 transition-colors hover:bg-black/5 hover:text-black dark:text-white/45 dark:hover:bg-white/8 dark:hover:text-white"
                aria-label={linkCopied ? 'Link copied' : 'Copy public link'}
                title={linkCopied ? 'Copied' : 'Copy public link'}
              >
                {linkCopied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2} />
                ) : (
                  <LinkIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
                )}
              </button>
            ) : null}

            <div className="flex items-center gap-1.5 rounded-full border border-black/10 px-2 py-1 dark:border-white/12">
              <Globe className="h-3.5 w-3.5 text-black/45 dark:text-white/45" strokeWidth={1.75} />
              <span className={cn(inter.className, 'text-[11px] font-medium text-black/55 dark:text-white/55')}>
                Public
              </span>
              <Switch
                size="sm"
                checked={visibility === 'public'}
                onCheckedChange={handleVisibility}
                aria-label="Public note"
              />
            </div>

            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg p-2 text-black/40 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-white/40 dark:hover:bg-red-500/10 dark:hover:text-red-400"
              aria-label="Delete note"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-10 sm:px-8">
        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled"
          className={cn(
            bricolage.className,
            'mb-6 w-full border-none bg-transparent text-3xl font-semibold tracking-tight text-black outline-none placeholder:text-black/25 dark:text-white dark:placeholder:text-white/25 sm:text-4xl',
          )}
        />

        <NotesEditor
          key={note.id}
          initialContent={note.content}
          onChange={handleContentChange}
        />

        <p className={cn(inter.className, 'mt-10 text-[12px] text-black/35 dark:text-white/35')}>
          Tip: type <kbd className="rounded bg-black/5 px-1.5 py-0.5 dark:bg-white/10">/</kbd> for
          commands · drag the handle to reorder · right-click for more options
        </p>
      </div>
    </div>
  );
}
