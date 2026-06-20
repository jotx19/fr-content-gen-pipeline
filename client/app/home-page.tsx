'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { LoginGate } from '@/components/LoginGate';
import { TefApp } from '@/components/TefApp';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchAuthMe, logout, type AuthUser } from '@/lib/auth-api';

export default function HomePage() {
  const searchParams = useSearchParams();
  const [auth, setAuth] = useState({
    checking: true,
    required: false,
    authenticated: false,
    user: null as AuthUser | null,
  });
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const data = await fetchAuthMe();
      setAuth({
        checking: false,
        required: data.authRequired,
        authenticated: data.authenticated,
        user: data.user,
      });
    } catch {
      setAuth({ checking: false, required: true, authenticated: false, user: null });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const status = searchParams.get('auth');
    if (!status) return;
    const messages: Record<string, string> = {
      denied: 'Google sign-in was cancelled.',
      failed: 'Sign-in failed. Please try again.',
      invalid: 'Invalid sign-in session. Please try again.',
      unconfigured: 'Google sign-in is not configured on the server.',
    };
    if (messages[status]) setAuthNotice(messages[status]);
    if (status === 'success') checkAuth();
    window.history.replaceState({}, '', '/');
  }, [searchParams, checkAuth]);

  const handleLogout = useCallback(async () => {
    await logout();
    setAuth({ checking: false, required: true, authenticated: false, user: null });
  }, []);

  const handleAuthError = useCallback(() => {
    setAuth({ checking: false, required: true, authenticated: false, user: null });
  }, []);

  if (auth.checking) {
    return (
      <div className="lesson-shell items-center justify-center gap-4 px-4 py-20">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  if (auth.required && !auth.authenticated) {
    return (
      <div>
        {authNotice && (
          <p className="bg-destructive/10 px-4 py-3 text-center text-sm font-semibold text-destructive">
            {authNotice}
          </p>
        )}
        <LoginGate onAuthenticated={checkAuth} />
      </div>
    );
  }

  return <TefApp user={auth.user} onLogout={handleLogout} onAuthError={handleAuthError} />;
}
