import type { FastifyInstance } from 'fastify';
import { attachUserId } from '../../../app/routes/auth.routes.js';
import { createRateLimitPreHandler } from '../../../app/gateway/security.js';
import * as notes from '../controllers/notes.controller.js';
import { createNoteSchema, updateNoteSchema } from '../schemas/notes.schema.js';

const createNoteRateLimit = createRateLimitPreHandler({
  keyPrefix: 'notes-create',
  max: 10,
  windowMs: 60_000,
  keyFn: (req) => (req as { userId?: string }).userId ?? req.ip,
});

export async function notesRoutes(app: FastifyInstance) {
  const auth = { preHandler: [attachUserId] };

  app.get('/api/notes', auth, notes.list);
  app.get('/api/notes/public/:id', notes.getPublic);
  app.get('/api/notes/:id', auth, notes.get);
  app.post('/api/notes', { preHandler: [attachUserId, createNoteRateLimit] }, async (req, reply) => {
    const body = createNoteSchema.parse(req.body ?? {});
    return notes.create({ ...req, body } as never, reply);
  });
  app.patch('/api/notes/:id', auth, async (req, reply) => {
    const body = updateNoteSchema.parse(req.body ?? {});
    return notes.update({ ...req, body } as never, reply);
  });
  app.delete('/api/notes/:id', auth, notes.remove);
}
