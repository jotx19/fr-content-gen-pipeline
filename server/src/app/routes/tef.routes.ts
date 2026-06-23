import type { FastifyInstance } from 'fastify';
import { readingRoutes } from '../../services/reading/routes/reading.routes.js';
import { writingRoutes } from '../../services/writing/routes/writing.routes.js';
import { listeningRoutes } from '../../services/listening/routes/listening.routes.js';

export async function tefRoutes(app: FastifyInstance) {
  await readingRoutes(app);
  await writingRoutes(app);
  await listeningRoutes(app);
}
