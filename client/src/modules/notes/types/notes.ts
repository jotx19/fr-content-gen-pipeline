export type NoteVisibility = 'private' | 'public';

export type Note = {
  id: string;
  userId: string;
  title: string;
  content: unknown;
  visibility: NoteVisibility;
  excerpt: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type NotesListResponse = {
  notes: Note[];
};
