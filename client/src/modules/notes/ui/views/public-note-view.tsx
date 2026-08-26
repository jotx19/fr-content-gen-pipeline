'use client';

import { useParams } from 'next/navigation';
import { Loader2 } from '@/components/icons';
import { BrandLogo } from '@/components/logo';
import { bricolage, inter } from '@/lib/fonts';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { NotesEditor } from '@/modules/notes/ui/components/notes-editor';
import { usePublicNoteQuery } from '@/modules/notes/hooks/use-notes-queries';

function PublicNoteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh w-full bg-background">
      <header className="px-4 pt-5 sm:px-8 sm:pt-6">
        <BrandLogo href="/" showText={false} iconSize={32} iconRounded="lg" />
      </header>
      {children}
    </div>
  );
}

export function PublicNoteView() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const { t } = useI18n();
  const { data: note, isLoading, isError } = usePublicNoteQuery(id, Boolean(id));

  if (isLoading) {
    return (
      <PublicNoteShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-black/40 dark:text-white/40" />
        </div>
      </PublicNoteShell>
    );
  }

  if (isError || !note) {
    return (
      <PublicNoteShell>
        <div className="flex min-h-[50vh] items-center justify-center px-6 text-center">
          <p className={cn(inter.className, 'text-sm text-black/60 dark:text-white/60')}>
            {t('notes.publicNotFound')}
          </p>
        </div>
      </PublicNoteShell>
    );
  }

  return (
    <PublicNoteShell>
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-12">
        <p
          className={cn(
            inter.className,
            'mb-3 text-[11px] uppercase tracking-[0.16em] text-black/40 dark:text-white/40',
          )}
        >
          {t('notes.publicLabel')}
        </p>
        <h1
          className={cn(
            bricolage.className,
            'mb-8 text-3xl font-semibold tracking-tight text-black dark:text-white sm:text-4xl',
          )}
        >
          {note.title || t('notes.untitled')}
        </h1>
        <NotesEditor initialContent={note.content} editable={false} />
      </div>
    </PublicNoteShell>
  );
}
