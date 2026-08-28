import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { isAuthenticatedRequest, unauthorized, getSessionUserId } from '../gateway/auth.js';
import { createRateLimitPreHandler, getClientIp, isIpBlocked } from '../gateway/security.js';
import * as auth from '../controllers/auth.controller.js';
import { googleCredentialSchema } from '../schemas/auth.schema.js';

const authRateLimit = createRateLimitPreHandler({
  keyPrefix: 'auth',
  max: 15,
  windowMs: 15 * 60 * 1000,
  keyFn: (req) => getClientIp(req),
});

export async function authRoutes(app: FastifyInstance) {
  app.post('/api/auth/google', { preHandler: [authRateLimit] }, async (req, reply) => {
    const ip = getClientIp(req);
    if (isIpBlocked(ip)) {
      return reply.status(403).send({ error: 'Access blocked', code: 'IP_BLOCKED' });
    }
    const body = googleCredentialSchema.parse(req.body);
    return auth.googleCredential({ ...req, body } as never, reply);
  });
  app.get('/api/auth/google/redirect', { preHandler: [authRateLimit] }, auth.googleStart);
  app.get('/api/auth/google/callback', { preHandler: [authRateLimit] }, auth.googleCallback);
  app.get('/api/auth/callback/google', { preHandler: [authRateLimit] }, auth.googleCallback);
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
