import type { FastifyInstance } from 'fastify';
import { authRoutes } from './auth.routes.js';
import { healthRoutes } from './health.routes.js';
import { tefRoutes } from './tef.routes.js';

export async function registerRoutes(app: FastifyInstance) {
  await authRoutes(app);
  await healthRoutes(app);
  await tefRoutes(app);
}
