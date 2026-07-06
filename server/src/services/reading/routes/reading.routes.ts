import type { FastifyInstance } from 'fastify';
import { attachUserId } from '../../../app/routes/auth.routes.js';
import * as reading from '../controllers/reading.controller.js';
import {
  submitAnswersSchema,
  evaluationHistoryQuerySchema,
  checkAnswerSchema,
  selfSelectLevelSchema,
} from '../schemas/reading.schema.js';

export async function readingRoutes(app: FastifyInstance) {
  const auth = { preHandler: [attachUserId] };

  app.get('/api/tef/profile', auth, reading.profile);
  app.get('/api/tef/evaluations', auth, async (req, reply) => {
    const query = evaluationHistoryQuerySchema.parse(req.query);
    return reading.evaluations({ ...req, query } as never, reply);
  });
  app.post('/api/tef/onboard/start', auth, reading.onboardStart);
  app.post('/api/tef/onboard/submit', auth, async (req, reply) => {
    const body = submitAnswersSchema.parse(req.body);
    return reading.onboardSubmit({ ...req, body } as never, reply);
  });
  app.get('/api/tef/practice', auth, reading.practiceGet);
  app.post('/api/tef/practice/submit', auth, async (req, reply) => {
    const body = submitAnswersSchema.parse(req.body);
    return reading.practiceSubmit({ ...req, body } as never, reply);
  });
  app.post('/api/tef/practice/prefetch', auth, reading.practicePrefetch);
  app.post('/api/tef/check-answer', auth, async (req, reply) => {
    const body = checkAnswerSchema.parse(req.body);
    return reading.checkAnswer({ ...req, body } as never, reply);
  });
  app.post('/api/tef/level/self-select', auth, async (req, reply) => {
    const body = selfSelectLevelSchema.parse(req.body);
    return reading.levelSelfSelect({ ...req, body } as never, reply);
  });
}
