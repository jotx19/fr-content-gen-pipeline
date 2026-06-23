import { OAuth2Client } from 'google-auth-library';
import { config } from '../../config.js';

let oauthClient: OAuth2Client | null = null;

/** Client ID alone is enough for Google Identity Services (ID token) sign-in. */
export function isGoogleAuthConfigured() {
  return Boolean(config.googleClientId);
}

export function isGoogleRedirectConfigured() {
  return Boolean(config.googleClientId && config.googleClientSecret);
}

function getVerifierClient() {
  if (!config.googleClientId) {
    throw new Error('GOOGLE_CLIENT_ID is not configured');
  }
  if (!oauthClient) {
    oauthClient = new OAuth2Client(config.googleClientId);
  }
  return oauthClient;
}

function getOAuthClient() {
  if (!isGoogleRedirectConfigured()) {
    throw new Error('Google redirect OAuth requires GOOGLE_CLIENT_SECRET');
  }
  return new OAuth2Client(
    config.googleClientId,
    config.googleClientSecret,
    config.googleRedirectUri
  );
}

export function getGoogleAuthUrl(state: string) {
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: 'online',
    prompt: 'select_account',
    scope: ['openid', 'email', 'profile'],
    state,
  });
}

function profileFromPayload(payload: {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
  locale?: string;
}) {
  if (!payload.sub || !payload.email) {
    throw new Error('Invalid Google profile');
  }
  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name || payload.email.split('@')[0],
    picture: payload.picture || null,
    locale: payload.locale || null,
  };
}

/** Verify GIS credential JWT — no client secret required. */
export async function verifyGoogleCredential(credential: string) {
  const client = getVerifierClient();
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: config.googleClientId,
  });
  return profileFromPayload(ticket.getPayload() ?? {});
}

export async function exchangeGoogleCode(code: string) {
  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);
  if (!tokens.id_token) {
    throw new Error('Google did not return an ID token');
  }
  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: config.googleClientId,
  });
  return profileFromPayload(ticket.getPayload() ?? {});
}
