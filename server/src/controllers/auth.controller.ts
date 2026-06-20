import type { FastifyRequest, FastifyReply } from 'fastify';
import {
  createSessionToken,
  createOAuthState,
  getSessionUserId,
  isAuthEnabled,
  oauthStateCookieOptions,
  OAUTH_STATE_COOKIE,
  sessionCookieOptions,
  SESSION_COOKIE,
  verifySessionToken,
} from '../gateway/auth.js';
import { config } from '../config.js';
import {
  exchangeGoogleCode,
  getGoogleAuthUrl,
  isGoogleAuthConfigured,
  isGoogleRedirectConfigured,
  verifyGoogleCredential,
} from '../services/googleAuth.js';
import { findOrCreateGoogleUser, getUserById, toPublicUser } from '../services/userService.js';
import type { GoogleCredentialBody } from '../schemas/auth.schema.js';

async function signInWithProfile(
  reply: FastifyReply,
  profile: Awaited<ReturnType<typeof verifyGoogleCredential>>
) {
  const user = await findOrCreateGoogleUser(profile);
  const token = createSessionToken(user._id.toString());
  reply.setCookie(SESSION_COOKIE, token, sessionCookieOptions(token));
  return { ok: true, user: toPublicUser(user) };
}

export async function googleStart(_req: FastifyRequest, reply: FastifyReply) {
  if (!isGoogleRedirectConfigured()) {
    return reply.status(503).send({
      error: 'Redirect sign-in requires GOOGLE_CLIENT_SECRET — use the Google button on the login page',
    });
  }
  const state = createOAuthState();
  reply.setCookie(OAUTH_STATE_COOKIE, state, oauthStateCookieOptions(state));
  const url = getGoogleAuthUrl(state);
  return reply.redirect(url);
}

export async function googleCallback(req: FastifyRequest, reply: FastifyReply) {
  if (!isGoogleRedirectConfigured()) {
    return reply.redirect(`${config.clientUrl}?auth=unconfigured`);
  }

  const query = req.query as { code?: string; state?: string; error?: string };
  if (query.error) {
    return reply.redirect(`${config.clientUrl}?auth=denied`);
  }

  const savedState = req.cookies[OAUTH_STATE_COOKIE];
  reply.clearCookie(OAUTH_STATE_COOKIE, { path: '/' });

  if (!query.code || !query.state || query.state !== savedState) {
    return reply.redirect(`${config.clientUrl}?auth=invalid`);
  }

  try {
    const profile = await exchangeGoogleCode(query.code);
    await signInWithProfile(reply, profile);
    return reply.redirect(`${config.clientUrl}?auth=success`);
  } catch (err) {
    console.warn('[auth] Google callback failed:', err instanceof Error ? err.message : err);
    return reply.redirect(`${config.clientUrl}?auth=failed`);
  }
}

export async function googleCredential(
  req: FastifyRequest<{ Body: GoogleCredentialBody }>,
  reply: FastifyReply
) {
  if (!isGoogleAuthConfigured()) {
    return reply.status(503).send({ error: 'Google sign-in is not configured' });
  }

  try {
    const profile = await verifyGoogleCredential(req.body.credential);
    const result = await signInWithProfile(reply, profile);
    return reply.send(result);
  } catch (err) {
    console.warn('[auth] Google credential failed:', err instanceof Error ? err.message : err);
    return reply.status(401).send({ error: 'Invalid Google sign-in' });
  }
}

export async function logout(_req: FastifyRequest, reply: FastifyReply) {
  reply.clearCookie(SESSION_COOKIE, { path: '/' });
  return reply.send({ ok: true });
}

export async function me(req: FastifyRequest, reply: FastifyReply) {
  const authRequired = isAuthEnabled();
  const userId = getSessionUserId(req);
  const authenticated = authRequired
    ? Boolean(userId && verifySessionToken(req.cookies[SESSION_COOKIE]))
    : true;

  if (!authenticated || !userId) {
    return reply.send({
      authRequired,
      authenticated: false,
      user: null,
    });
  }

  const user = await getUserById(userId);
  if (!user) {
    return reply.send({
      authRequired,
      authenticated: false,
      user: null,
    });
  }

  return reply.send({
    authRequired,
    authenticated: true,
    user: toPublicUser(user),
  });
}
