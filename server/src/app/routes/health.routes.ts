import type { FastifyInstance } from 'fastify';
import * as health from '../controllers/health.controller.js';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/api/health', health.health);
}
