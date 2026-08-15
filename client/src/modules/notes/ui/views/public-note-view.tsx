'use client';

import { useParams } from 'next/navigation';
import { Loader2 } from '@/components/icons';
import { bricolage, inter } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { NotesEditor } from '@/modules/notes/ui/components/notes-editor';
import { usePublicNoteQuery } from '@/modules/notes/hooks/use-notes-queries';

export function PublicNoteView() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const { data: note, isLoading, isError } = usePublicNoteQuery(id, Boolean(id));

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-black/40 dark:text-white/40" />
      </div>
    );
  }

  if (isError || !note) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6 text-center">
        <p className={cn(inter.className, 'text-sm text-black/60 dark:text-white/60')}>
          This note is private or does not exist.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh w-full bg-background">
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-8">
        <p className={cn(inter.className, 'mb-3 text-[11px] uppercase tracking-[0.16em] text-black/40 dark:text-white/40')}>
          Public note
        </p>
        <h1
          className={cn(
            bricolage.className,
            'mb-8 text-3xl font-semibold tracking-tight text-black dark:text-white sm:text-4xl',
          )}
        >
          {note.title || 'Untitled'}
        </h1>
        <NotesEditor initialContent={note.content} editable={false} />
      </div>
    </div>
  );
}
