import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { isAuthenticatedRequest, unauthorized, getSessionUserId } from '../gateway/auth.js';
import * as auth from '../controllers/auth.controller.js';
import { googleCredentialSchema } from '../schemas/auth.schema.js';

export async function authRoutes(app: FastifyInstance) {
  app.post('/api/auth/google', async (req, reply) => {
    const body = googleCredentialSchema.parse(req.body);
    return auth.googleCredential({ ...req, body } as never, reply);
  });
  app.get('/api/auth/google/redirect', auth.googleStart);
  app.get('/api/auth/google/callback', auth.googleCallback);
  app.get('/api/auth/callback/google', auth.googleCallback);
  app.post('/api/auth/logout', auth.logout);
  app.get('/api/auth/me', auth.me);
}

export function requireAuth(req: FastifyRequest, reply: FastifyReply, done: () => void) {
  if (!isAuthenticatedRequest(req)) {
    unauthorized(reply);
    return;
  }
  done();
}

export function attachUserId(req: FastifyRequest, reply: FastifyReply, done: () => void) {
  if (!isAuthenticatedRequest(req)) {
    unauthorized(reply);
    return;
  }
  const userId = getSessionUserId(req);
  if (!userId) {
    unauthorized(reply);
    return;
  }
  (req as FastifyRequest & { userId: string }).userId = userId;
  done();
}
