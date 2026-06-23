import type { FastifyInstance } from 'fastify';
import { attachUserId } from '../../../app/routes/auth.routes.js';
import * as writing from '../controllers/writing.controller.js';
import {
  submitWritingSchema,
  writingExampleSchema,
  writingEvaluationQuerySchema,
  writingPromptQuerySchema,
} from '../schemas/writing.schema.js';

export async function writingRoutes(app: FastifyInstance) {
  const auth = { preHandler: [attachUserId] };

  app.get('/api/tef/writing/profile', auth, writing.profile);
  app.get('/api/tef/writing/prompt', auth, async (req, reply) => {
    const query = writingPromptQuerySchema.parse(req.query);
    return writing.prompt({ ...req, query } as never, reply);
  });
  app.post('/api/tef/writing/submit', auth, async (req, reply) => {
    const body = submitWritingSchema.parse(req.body);
    return writing.submit({ ...req, body } as never, reply);
  });
  app.post('/api/tef/writing/example', auth, async (req, reply) => {
    writingExampleSchema.parse(req.body ?? {});
    return writing.example(req as never, reply);
  });
  app.get('/api/tef/writing/evaluations', auth, async (req, reply) => {
    const query = writingEvaluationQuerySchema.parse(req.query);
    return writing.evaluations({ ...req, query } as never, reply);
  });
}
