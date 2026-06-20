import type { FastifyInstance } from 'fastify';
import { attachUserId } from './auth.routes.js';
import * as tef from '../controllers/tef.controller.js';
import { submitAnswersSchema, evaluationHistoryQuerySchema, checkAnswerSchema } from '../schemas/tef.schema.js';

export async function tefRoutes(app: FastifyInstance) {
  const auth = { preHandler: [attachUserId] };

  app.get('/api/tef/profile', auth, tef.profile);
  app.get('/api/tef/evaluations', auth, async (req, reply) => {
    const query = evaluationHistoryQuerySchema.parse(req.query);
    return tef.evaluations({ ...req, query } as never, reply);
  });
  app.post('/api/tef/onboard/start', auth, tef.onboardStart);
  app.post('/api/tef/onboard/submit', auth, async (req, reply) => {
    const body = submitAnswersSchema.parse(req.body);
    return tef.onboardSubmit({ ...req, body } as never, reply);
  });
  app.get('/api/tef/practice', auth, tef.practiceGet);
  app.post('/api/tef/practice/submit', auth, async (req, reply) => {
    const body = submitAnswersSchema.parse(req.body);
    return tef.practiceSubmit({ ...req, body } as never, reply);
  });
  app.post('/api/tef/practice/prefetch', auth, tef.practicePrefetch);
  app.post('/api/tef/check-answer', auth, async (req, reply) => {
    const body = checkAnswerSchema.parse(req.body);
    return tef.checkAnswer({ ...req, body } as never, reply);
  });
}
