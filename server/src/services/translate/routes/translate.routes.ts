import type { FastifyInstance } from 'fastify';
import { attachUserId } from '../../../app/routes/auth.routes.js';
import * as translate from '../controllers/translate.controller.js';
import { translateBodySchema } from '../schemas/translate.schema.js';

export async function translateRoutes(app: FastifyInstance) {
  const auth = { preHandler: [attachUserId] };

  app.post('/api/translate', auth, async (req, reply) => {
    const body = translateBodySchema.parse(req.body ?? {});
    return translate.translate({ ...req, body } as never, reply);
  });
}
