import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import { config } from '../../config.js';
import { connectDB } from '../db/mongo.js';
import { ensureCollection } from '../db/qdrant.js';
import { loadSubagents } from '../../content-pipeline/agent/subagent_registry.js';
import { registerRoutes } from '../routes/index.js';

export async function buildServer() {
  const app = Fastify({
    logger: config.nodeEnv !== 'production',
    // Writing evaluation via OpenRouter can take 30–90s on a single model.
    connectionTimeout: 180_000,
    requestTimeout: 180_000,
  });

  await app.register(fastifyCors, {
    origin: config.clientUrl,
    credentials: true,
  });

  await app.register(fastifyCookie);

  app.setErrorHandler((err, _req, reply) => {
    const error = err as Error & { name?: string };
    if (error.name === 'ZodError') {
      return reply.status(400).send({ error: 'Validation failed', details: error.message });
    }
    console.warn('[api]', error.message);
    return reply.status(500).send({ error: error.message || 'Internal server error' });
  });

  await registerRoutes(app);

  app.setNotFoundHandler((_req, reply) => {
    reply.status(404).send({ error: 'Not found' });
  });

  return app;
}

export async function startServer() {
  process.on('unhandledRejection', (reason) => {
    const message = reason instanceof Error ? reason.message : String(reason);
    console.warn('[tef-agent] unhandled rejection (logged, not exiting):', message);
  });

  await connectDB();
  await ensureCollection().catch(() => {});
  loadSubagents();

  const app = await buildServer();
  await app.listen({ port: config.port, host: config.host });
  console.log(`[tef-agent-server] API on ${config.host}:${config.port}`);
  return app;
}
