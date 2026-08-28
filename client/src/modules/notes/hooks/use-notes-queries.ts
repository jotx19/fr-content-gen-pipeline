'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createNote,
  deleteNote,
  fetchNote,
  fetchNotes,
  fetchPublicNote,
  updateNote,
} from '../api/notes';
import type { NoteVisibility } from '../types/notes';
import { notesKeys } from './keys';

export function useNotesQuery(enabled = true) {
  return useQuery({
    queryKey: notesKeys.list(),
    queryFn: fetchNotes,
    enabled,
  });
}

export function useNoteQuery(id: string | null, enabled = true) {
  return useQuery({
    queryKey: notesKeys.detail(id ?? ''),
    queryFn: () => fetchNote(id!),
    enabled: Boolean(id) && enabled,
  });
}

export function usePublicNoteQuery(id: string | null, enabled = true) {
  return useQuery({
    queryKey: notesKeys.public(id ?? ''),
    queryFn: () => fetchPublicNote(id!),
    enabled: Boolean(id) && enabled,
  });
}

export function useCreateNoteMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notesKeys.list() });
      qc.invalidateQueries({ queryKey: ['billing', 'status'] });
    },
  });
}

export function useUpdateNoteMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: string;
      title?: string;
      content?: unknown;
      visibility?: NoteVisibility;
      excerpt?: string;
    }) => updateNote(id, payload),
    onSuccess: (note) => {
      qc.invalidateQueries({ queryKey: notesKeys.list() });
      qc.setQueryData(notesKeys.detail(note.id), note);
    },
  });
}

export function useDeleteNoteMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notesKeys.list() });
      qc.invalidateQueries({ queryKey: ['billing', 'status'] });
    },
  });
}
