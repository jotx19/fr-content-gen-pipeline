// @ts-nocheck
import { Note } from '../../../app/db/mongo.js';
import { assertFeatureAccess } from '../../billing/freemium.js';
import type { CreateNoteBody, UpdateNoteBody } from '../schemas/notes.schema.js';

function serialize(doc: {
  _id: { toString(): string };
  userId: string;
  title: string;
  content: unknown;
  visibility: string;
  excerpt: string;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    title: doc.title || 'Untitled',
    content: doc.content ?? null,
    visibility: doc.visibility as 'private' | 'public',
    excerpt: doc.excerpt || '',
    createdAt: doc.createdAt?.toISOString() ?? null,
    updatedAt: doc.updatedAt?.toISOString() ?? null,
  };
}

export async function listNotes(userId: string) {
  const docs = await Note.find({ userId }).sort({ updatedAt: -1 }).lean();
  return docs.map(serialize);
}

export async function getNote(userId: string, id: string) {
  const doc = await Note.findOne({ _id: id, userId }).lean();
  if (!doc) return null;
  return serialize(doc);
}

export async function getPublicNote(id: string) {
  const doc = await Note.findOne({ _id: id, visibility: 'public' }).lean();
  if (!doc) return null;
  return serialize(doc);
}

export async function createNote(userId: string, body: CreateNoteBody) {
  await assertFeatureAccess(userId, 'notes');
  const doc = await Note.create({
    userId,
    title: body.title?.trim() || 'Untitled',
    content: body.content ?? null,
    visibility: body.visibility ?? 'private',
    excerpt: '',
  });
  return serialize(doc.toObject());
}

export async function updateNote(userId: string, id: string, body: UpdateNoteBody) {
  const update: Record<string, unknown> = {};
  if (body.title !== undefined) update.title = body.title.trim() || 'Untitled';
  if (body.content !== undefined) update.content = body.content;
  if (body.visibility !== undefined) update.visibility = body.visibility;
  if (body.excerpt !== undefined) update.excerpt = body.excerpt;

  const doc = await Note.findOneAndUpdate({ _id: id, userId }, { $set: update }, { new: true }).lean();
  if (!doc) return null;
  return serialize(doc);
}

export async function deleteNote(userId: string, id: string) {
  const res = await Note.deleteOne({ _id: id, userId });
  return res.deletedCount === 1;
}
