'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Loader2, Note, Plus, Trash2 } from '@/components/icons';
import { bricolage, inter } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import {
  useCreateNoteMutation,
  useDeleteNoteMutation,
  useNotesQuery,
} from '@/modules/notes/hooks/use-notes-queries';
import { useAuthStore } from '@/store/authStore';

const panel =
  'rounded-[24px] bg-[#FCFCFC] shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:bg-[#1C1C1C] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] sm:rounded-[28px]';

function formatDate(value?: string | null) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

export function NotesListView() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: notes, isLoading, isError } = useNotesQuery(Boolean(user));
  const createNote = useCreateNoteMutation();
  const removeNote = useDeleteNoteMutation();

  const handleCreate = async () => {
    try {
      const note = await createNote.mutateAsync({ title: 'Untitled' });
      router.push(`/notes/${note.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create note');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await removeNote.mutateAsync(id);
      toast.success('Note deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete note');
    }
  };

  return (
    <div className="min-h-dvh w-full px-4 pb-12 pt-6 sm:px-8 sm:pt-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1
              className={cn(
                bricolage.className,
                'text-2xl font-semibold tracking-tight text-black dark:text-white sm:text-3xl',
              )}
            >
              Notes
            </h1>
            <p className={cn(inter.className, 'mt-1 text-sm text-black/55 dark:text-white/55')}>
              Capture ideas, vocab, and study notes
            </p>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            disabled={createNote.isPending}
            className={cn(
              inter.className,
              'inline-flex h-10 items-center gap-2 rounded-full bg-black px-4 text-sm font-medium text-white',
              'transition-opacity hover:opacity-90 disabled:opacity-60 dark:bg-white dark:text-black',
            )}
          >
            {createNote.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" strokeWidth={2} />
            )}
            New note
          </button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={cn(panel, 'h-36 animate-pulse')} />
            ))}
          </div>
        ) : isError ? (
          <p className={cn(inter.className, 'text-sm text-red-500')}>
            Could not load notes. Try again.
          </p>
        ) : !notes?.length ? (
          <div
            className={cn(
              panel,
              'flex flex-col items-center justify-center px-6 py-16 text-center',
            )}
          >
            <Note className="mb-3 h-8 w-8 text-black/30 dark:text-white/30" strokeWidth={1.5} />
            <p className={cn(bricolage.className, 'text-lg font-medium text-black dark:text-white')}>
              No notes yet
            </p>
            <p className={cn(inter.className, 'mt-1 max-w-sm text-sm text-black/55 dark:text-white/55')}>
              Create your first page. Use / for commands, drag blocks, and set notes public or private.
            </p>
            <button
              type="button"
              onClick={handleCreate}
              className={cn(
                inter.className,
                'mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-black px-5 text-sm font-medium text-white dark:bg-white dark:text-black',
              )}
            >
              <Plus className="h-4 w-4" />
              Create note
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                className={cn(
                  panel,
                  'group relative flex min-h-[140px] flex-col px-5 py-5 hover:bg-[#F4F4F4] dark:hover:bg-[#242424]',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2
                    className={cn(
                      bricolage.className,
                      'line-clamp-2 text-lg font-semibold tracking-tight text-black dark:text-white',
                    )}
                  >
                    {note.title || 'Untitled'}
                  </h2>
                  <button
                    type="button"
                    aria-label="Delete note"
                    onClick={(e) => handleDelete(note.id, e)}
                    className="rounded-lg p-1.5 text-black/30 opacity-0 transition-opacity hover:bg-black/5 hover:text-red-500 group-hover:opacity-100 dark:text-white/30 dark:hover:bg-white/10 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </div>
                <p
                  className={cn(
                    inter.className,
                    'mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-black/55 dark:text-white/55',
                  )}
                >
                  {note.excerpt || 'Empty page'}
                </p>
                <div
                  className={cn(
                    inter.className,
                    'mt-4 flex items-center justify-between text-[11px] text-black/40 dark:text-white/40',
                  )}
                >
                  <span>{formatDate(note.updatedAt)}</span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 capitalize',
                      note.visibility === 'public'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-black/5 text-black/50 dark:bg-white/10 dark:text-white/50',
                    )}
                  >
                    {note.visibility}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
