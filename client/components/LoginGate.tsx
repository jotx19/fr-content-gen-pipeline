'use client';

import { useState } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { GraduationCap, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { loginWithGoogleCredential } from '@/lib/auth-api';

type Props = {
  onAuthenticated: () => void;
};

export function LoginGate({ onAuthenticated }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setError('Google did not return a credential');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogleCredential(response.credential);
      onAuthenticated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lesson-shell items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md border-2 shadow-lg animate-bounce-in">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15">
            <GraduationCap className="h-9 w-9 text-primary" />
          </div>
          <CardTitle className="text-2xl">TEF Canada Coach</CardTitle>
          <CardDescription className="text-base">
            Learn French the fun way — adaptive placement and daily practice for TEF Canada.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            {loading ? (
              <p className="text-sm font-semibold text-muted-foreground">Signing in…</p>
            ) : (
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => setError('Google sign-in was cancelled or failed')}
                theme="outline"
                size="large"
                text="continue_with"
                shape="pill"
                width="320"
              />
            )}
          </div>
          {error && (
            <p className="rounded-xl bg-destructive/10 px-4 py-3 text-center text-sm font-semibold text-destructive">
              {error}
            </p>
          )}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-duo-yellow" />
            <span>Your progress syncs across devices</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
