import crypto from 'crypto';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { config } from '../../config.js';
import { isGoogleAuthConfigured } from '../services/googleAuth.js';

export const SESSION_COOKIE = 'tef_session';
const OAUTH_STATE_COOKIE = 'tef_oauth_state';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function isAuthEnabled() {
  return isGoogleAuthConfigured();
}

function getSecret() {
  if (config.authSecret) return config.authSecret;
  if (config.nodeEnv === 'production') {
    throw new Error('AUTH_SECRET is required in production');
  }
  return process.env.OPENROUTER_API_KEY || 'tef-dev-insecure-secret';
}

function sign(payloadB64: string) {
  return crypto.createHmac('sha256', getSecret()).update(payloadB64).digest('base64url');
}

export function createSessionToken(userId: string) {
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + MAX_AGE_MS, v: 2, userId })
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function parseSessionToken(token: string | undefined | null) {
  if (!token || typeof token !== 'string') return null;
  const dot = token.lastIndexOf('.');
  if (dot === -1) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (sig !== sign(payload)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof data.exp !== 'number' || data.exp <= Date.now()) return null;
    if (typeof data.userId !== 'string' || !data.userId) return null;
    return { userId: data.userId, exp: data.exp };
  } catch {
    return null;
  }
}

export function verifySessionToken(token: string | undefined | null) {
  return parseSessionToken(token) !== null;
}

export function getSessionUserId(req: FastifyRequest): string | null {
  const token = req.cookies[SESSION_COOKIE];
  return parseSessionToken(token)?.userId ?? null;
}

export function isAuthenticatedRequest(req: FastifyRequest) {
  if (!isAuthEnabled()) return true;
  return verifySessionToken(req.cookies[SESSION_COOKIE]);
}

function sessionCookieSameSite() {
  const mode = config.sessionCookieSameSite;
  if (mode === 'none' || mode === 'strict' || mode === 'lax') return mode;
  return 'lax';
}

export function sessionCookieOptions(token: string) {
  const sameSite = sessionCookieSameSite();
  return {
    path: '/',
    httpOnly: true,
    sameSite,
    secure: sameSite === 'none' || config.nodeEnv === 'production',
    maxAge: Math.floor(MAX_AGE_MS / 1000),
    value: token,
  };
}

export function createOAuthState() {
  return crypto.randomBytes(24).toString('base64url');
}

export function oauthStateCookieOptions(state: string) {
  const sameSite = sessionCookieSameSite();
  return {
    path: '/',
    httpOnly: true,
    sameSite,
    secure: sameSite === 'none' || config.nodeEnv === 'production',
    maxAge: 600,
    value: state,
  };
}

export { OAUTH_STATE_COOKIE };

export function unauthorized(reply: FastifyReply) {
  return reply.status(401).send({ error: 'Unauthorized', code: 'AUTH_REQUIRED' });
}

export function requireUserId(req: FastifyRequest, reply: FastifyReply): string | null {
  if (!isAuthEnabled()) {
    return getSessionUserId(req) || 'dev-anonymous-user';
  }
  const userId = getSessionUserId(req);
  if (!userId) {
    unauthorized(reply);
    return null;
  }
  return userId;
}
