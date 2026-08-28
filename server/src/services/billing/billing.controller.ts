import type { FastifyReply, FastifyRequest } from 'fastify';
import { getSessionUserId } from '../../app/gateway/auth.js';
import { config } from '../../config.js';
import { PaywallError } from './freemium.js';
import {
  createBillingPortalSession,
  createCheckoutSession,
  getBillingPrices,
  getBillingStatus,
  handleStripeWebhook,
  type BillingInterval,
} from './billing.methods.js';

type AuthedRequest = FastifyRequest & { userId: string };

type CheckoutBody = {
  interval?: BillingInterval;
};

function requireUserId(req: FastifyRequest): string {
  const userId = getSessionUserId(req);
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

export async function status(req: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = requireUserId(req);
    return reply.send(await getBillingStatus(userId));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Billing status failed';
    return reply.status(message === 'Unauthorized' ? 401 : 500).send({ error: message });
  }
}

export async function prices(_req: FastifyRequest, reply: FastifyReply) {
  try {
    return reply.send(await getBillingPrices());
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Billing prices failed';
    return reply.status(500).send({ error: message });
  }
}

export async function checkout(req: AuthedRequest, reply: FastifyReply) {
  try {
    const userId = requireUserId(req);
    const body = (req.body ?? {}) as CheckoutBody;
    const interval: BillingInterval = body.interval === 'year' ? 'year' : 'month';
    const data = await createCheckoutSession(userId, interval);
    return reply.send(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout failed';
    return reply.status(503).send({ error: message });
  }
}

export async function portal(req: AuthedRequest, reply: FastifyReply) {
  try {
    const userId = requireUserId(req);
    const data = await createBillingPortalSession(userId);
    return reply.send(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Portal failed';
    return reply.status(503).send({ error: message });
  }
}

export async function webhook(req: FastifyRequest, reply: FastifyReply) {
  try {
    if (!req.rawBody || !Buffer.isBuffer(req.rawBody)) {
      throw new Error('Missing raw webhook body — check Stripe webhook raw-body middleware');
    }
    if (!config.stripeWebhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set — copy whsec_... from `stripe listen`');
    }

    const signature = req.headers['stripe-signature'] as string | undefined;
    const result = await handleStripeWebhook(req.rawBody, signature);
    return reply.send(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook failed';
    console.warn('[billing] webhook error:', message);
    return reply.status(400).send({ error: message });
  }
}

export function sendPaywall(reply: FastifyReply, err: PaywallError) {
  return reply.status(403).send({
    error: err.message,
    code: 'PAYWALL',
    feature: err.feature,
    limit: err.limit,
    used: err.used,
  });
}
