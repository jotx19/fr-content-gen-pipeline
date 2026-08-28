import type { FastifyInstance } from 'fastify';
import { attachUserId } from '../../../app/routes/auth.routes.js';
import * as billing from '../billing.controller.js';

export async function billingRoutes(app: FastifyInstance) {
  const auth = { preHandler: [attachUserId] };

  app.get('/api/billing/prices', billing.prices);
  app.get('/api/billing/status', auth, billing.status);
  app.post('/api/billing/checkout', auth, billing.checkout);
  app.post('/api/billing/portal', auth, billing.portal);
  app.post('/api/billing/webhook', billing.webhook);
}
