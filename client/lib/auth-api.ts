const API_OPTS: RequestInit = { credentials: 'include' };

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  picture: string | null;
};

export type AuthState = {
  authRequired: boolean;
  authenticated: boolean;
  user: AuthUser | null;
};

export async function fetchAuthMe(): Promise<AuthState> {
  const res = await fetch('/api/auth/me', API_OPTS);
  const data = await res.json();
  return {
    authRequired: Boolean(data.authRequired),
    authenticated: Boolean(data.authenticated),
    user: data.user ?? null,
  };
}

export async function loginWithGoogleCredential(credential: string): Promise<AuthUser> {
  const res = await fetch('/api/auth/google', {
    method: 'POST',
    ...API_OPTS,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Google sign-in failed');
  }
  return data.user as AuthUser;
}

export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST', ...API_OPTS }).catch(() => {});
}
