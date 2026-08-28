import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import { Readable } from 'node:stream';
import { config } from '../../config.js';
import { connectDB } from '../db/mongo.js';
import { ensureCollection } from '../db/qdrant.js';
import { loadSubagents } from '../../content-pipeline/agent/subagent_registry.js';
import { registerRoutes } from '../routes/index.js';
import { registerSecurity } from './security.js';

export async function buildServer() {
  const app = Fastify({
    logger: config.nodeEnv !== 'production',
    trustProxy: true,
    // Writing evaluation via OpenRouter can take 30–90s on a single model.
    connectionTimeout: 180_000,
    requestTimeout: 180_000,
  });

  const allowedOrigins = new Set(config.corsOrigins);
  await app.register(fastifyCors, {
    origin(origin, cb) {
      if (!origin || allowedOrigins.has(origin)) {
        cb(null, true);
        return;
      }
      cb(null, false);
    },
    credentials: true,
  });

  await app.register(fastifyCookie);

  await registerSecurity(app);

  // Stripe webhook signature verification requires the untouched raw body.
  app.addHook('preParsing', async (request, _reply, payload) => {
    const path = request.url.split('?')[0];
    if (path !== '/api/billing/webhook') return payload;

    const chunks: Buffer[] = [];
    for await (const chunk of payload) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const raw = Buffer.concat(chunks);
    request.rawBody = raw;
    return Readable.from(raw);
  });

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
