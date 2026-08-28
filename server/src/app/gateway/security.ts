import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { config } from '../../config.js';

type Bucket = { count: number; resetAt: number };
type BlockEntry = { until: number; reason: string };

const rateBuckets = new Map<string, Bucket>();
const temporaryBlocks = new Map<string, BlockEntry>();

function pruneExpiredBlocks(): void {
  const now = Date.now();
  for (const [ip, block] of temporaryBlocks) {
    if (now > block.until) temporaryBlocks.delete(ip);
  }
}

export function getClientIp(req: FastifyRequest): string {
  return req.ip || 'unknown';
}

export function isIpBlocked(ip: string): boolean {
  if (config.blockedIps.includes(ip)) return true;
  pruneExpiredBlocks();
  const block = temporaryBlocks.get(ip);
  return Boolean(block && Date.now() <= block.until);
}

export function blockIpTemporarily(ip: string, durationMs: number, reason: string): void {
  temporaryBlocks.set(ip, { until: Date.now() + durationMs, reason });
}

function touchBucket(key: string, max: number, windowMs: number): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const existing = rateBuckets.get(key);
  if (!existing || now > existing.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  if (existing.count >= max) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)) };
  }
  existing.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): { ok: boolean; retryAfterSec: number } {
  return touchBucket(key, max, windowMs);
}

export function recordLoginFailure(ip: string): void {
  const shortKey = `auth-fail:${ip}`;
  const short = touchBucket(shortKey, config.securityAuthRateLimit, config.securityAuthWindowMs);

  const hourKey = `auth-fail-hour:${ip}`;
  touchBucket(hourKey, config.securityLoginBlockThreshold, 60 * 60 * 1000);

  const hourBucket = rateBuckets.get(hourKey);
  if (hourBucket && hourBucket.count >= config.securityLoginBlockThreshold) {
    blockIpTemporarily(ip, config.securityLoginBlockMs, 'too_many_login_failures');
  }

  if (!short.ok) {
    blockIpTemporarily(ip, config.securityAuthWindowMs, 'auth_rate_limit');
  }
}

export function clearLoginFailures(ip: string): void {
  rateBuckets.delete(`auth-fail:${ip}`);
}

function sendBlocked(reply: FastifyReply) {
  return reply.status(403).send({ error: 'Access blocked', code: 'IP_BLOCKED' });
}

function sendRateLimited(reply: FastifyReply, retryAfterSec: number) {
  reply.header('Retry-After', String(retryAfterSec));
  return reply.status(429).send({ error: 'Too many requests', code: 'RATE_LIMIT' });
}

export function createRateLimitPreHandler(options: {
  keyPrefix: string;
  max: number;
  windowMs: number;
  keyFn?: (req: FastifyRequest) => string;
}) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const ip = getClientIp(req);
    if (isIpBlocked(ip)) {
      return sendBlocked(reply);
    }
    const suffix = options.keyFn ? options.keyFn(req) : ip;
    const result = checkRateLimit(`${options.keyPrefix}:${suffix}`, options.max, options.windowMs);
    if (!result.ok) {
      return sendRateLimited(reply, result.retryAfterSec);
    }
  };
}

export async function registerSecurity(app: FastifyInstance): Promise<void> {
  app.addHook('onRequest', async (req, reply) => {
    const ip = getClientIp(req);
    if (isIpBlocked(ip)) {
      return sendBlocked(reply);
    }

    const global = checkRateLimit(`global:${ip}`, config.securityGlobalRateLimit, 60_000);
    if (!global.ok) {
      return sendRateLimited(reply, global.retryAfterSec);
    }
  });
}
