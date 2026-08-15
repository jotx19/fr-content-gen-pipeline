import { axiosInstance } from '@/lib/axios';
import type { Note, NotesListResponse, NoteVisibility } from '../types/notes';

export async function fetchNotes() {
  const { data } = await axiosInstance.get<NotesListResponse>('/notes');
  return data.notes;
}

export async function fetchNote(id: string) {
  const { data } = await axiosInstance.get<Note>(`/notes/${id}`);
  return data;
}

export async function fetchPublicNote(id: string) {
  const { data } = await axiosInstance.get<Note>(`/notes/public/${id}`);
  return data;
}

export async function createNote(payload?: {
  title?: string;
  content?: unknown;
  visibility?: NoteVisibility;
}) {
  const { data } = await axiosInstance.post<Note>('/notes', payload ?? {});
  return data;
}

export async function updateNote(
  id: string,
  payload: {
    title?: string;
    content?: unknown;
    visibility?: NoteVisibility;
    excerpt?: string;
  }
) {
  const { data } = await axiosInstance.patch<Note>(`/notes/${id}`, payload);
  return data;
}

export async function deleteNote(id: string) {
  await axiosInstance.delete(`/notes/${id}`);
}
