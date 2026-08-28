import type { FastifyInstance } from 'fastify';
import { attachUserId } from '../../../app/routes/auth.routes.js';
import { createRateLimitPreHandler } from '../../../app/gateway/security.js';
import * as translate from '../controllers/translate.controller.js';
import { translateBodySchema } from '../schemas/translate.schema.js';

const translateRateLimit = createRateLimitPreHandler({
  keyPrefix: 'translate',
  max: 30,
  windowMs: 60_000,
  keyFn: (req) => (req as { userId?: string }).userId ?? req.ip,
});

export async function translateRoutes(app: FastifyInstance) {
  const auth = { preHandler: [attachUserId, translateRateLimit] };

  app.post('/api/translate', auth, async (req, reply) => {
    const body = translateBodySchema.parse(req.body ?? {});
    return translate.translate({ ...req, body } as never, reply);
  });
}
