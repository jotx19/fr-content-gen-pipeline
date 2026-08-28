import type { FastifyRequest, FastifyReply } from 'fastify';
import {
  listNotes,
  getNote,
  getPublicNote,
  createNote,
  updateNote,
  deleteNote,
} from '../methods/notes.methods.js';
import type { CreateNoteBody, UpdateNoteBody } from '../schemas/notes.schema.js';
import { PaywallError } from '../../billing/freemium.js';
import { sendPaywall } from '../../billing/billing.controller.js';

type AuthedRequest = FastifyRequest & { userId: string };

function mapError(reply: FastifyReply, err: unknown) {
  if (err instanceof PaywallError) {
    return sendPaywall(reply, err);
  }
  const message = err instanceof Error ? err.message : 'Internal server error';
  if (message.includes('Cast to ObjectId') || message.includes('not found')) {
    return reply.status(404).send({ error: 'Note not found' });
  }
  return reply.status(500).send({ error: message });
}

export async function list(req: AuthedRequest, reply: FastifyReply) {
  try {
    const notes = await listNotes(req.userId);
    return reply.send({ notes });
  } catch (err) {
    return mapError(reply, err);
  }
}

export async function get(req: AuthedRequest, reply: FastifyReply) {
  try {
    const { id } = req.params as { id: string };
    const note = await getNote(req.userId, id);
    if (!note) return reply.status(404).send({ error: 'Note not found' });
    return reply.send(note);
  } catch (err) {
    return mapError(reply, err);
  }
}

export async function getPublic(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = req.params as { id: string };
    const note = await getPublicNote(id);
    if (!note) return reply.status(404).send({ error: 'Note not found' });
    return reply.send(note);
  } catch (err) {
    return mapError(reply, err);
  }
}

export async function create(req: AuthedRequest, reply: FastifyReply) {
  try {
    const body = req.body as CreateNoteBody;
    const note = await createNote(req.userId, body);
    return reply.status(201).send(note);
  } catch (err) {
    return mapError(reply, err);
  }
}

export async function update(req: AuthedRequest, reply: FastifyReply) {
  try {
    const { id } = req.params as { id: string };
    const body = req.body as UpdateNoteBody;
    const note = await updateNote(req.userId, id, body);
    if (!note) return reply.status(404).send({ error: 'Note not found' });
    return reply.send(note);
  } catch (err) {
    return mapError(reply, err);
  }
}

export async function remove(req: AuthedRequest, reply: FastifyReply) {
  try {
    const { id } = req.params as { id: string };
    const ok = await deleteNote(req.userId, id);
    if (!ok) return reply.status(404).send({ error: 'Note not found' });
    return reply.status(204).send();
  } catch (err) {
    return mapError(reply, err);
  }
}
