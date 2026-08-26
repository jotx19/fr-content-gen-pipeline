import type { FastifyInstance } from 'fastify';
import { Readable } from 'node:stream';
import { attachUserId } from '../../../app/routes/auth.routes.js';
import * as billing from '../billing.controller.js';

export async function billingRoutes(app: FastifyInstance) {
  const auth = { preHandler: [attachUserId] };

  app.addHook('preParsing', async (request, _reply, payload) => {
    if (!request.url.includes('/api/billing/webhook')) return payload;

    const chunks: Buffer[] = [];
    for await (const chunk of payload) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const raw = Buffer.concat(chunks);
    request.rawBody = raw;

    return Readable.from(raw);
  });

  app.get('/api/billing/prices', billing.prices);
  app.get('/api/billing/status', auth, billing.status);
  app.post('/api/billing/checkout', auth, billing.checkout);
  app.post('/api/billing/portal', auth, billing.portal);
  app.post('/api/billing/webhook', billing.webhook);
}
