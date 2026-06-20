'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { GraduationCap, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGoogleLoginMutation } from '@/modules/auth/hooks/use-auth-query';

export function SignInView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/learn';
  const login = useGoogleLoginMutation();

  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      toast.error('Google did not return a credential');
      return;
    }
    try {
      await login.mutateAsync(response.credential);
      toast.success('Welcome back!');
      router.replace(next.startsWith('/') ? next : '/learn');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign-in failed');
    }
  };

  return (
    <div className="lesson-shell items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 shadow-lg">
          <CardHeader className="items-center text-center">
            <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15">
              <GraduationCap className="h-9 w-9 text-primary" />
            </div>
            <CardTitle className="text-2xl">TEF Canada Coach</CardTitle>
            <CardDescription className="text-base">
              Sign in to save your level, weak areas, and full evaluation history.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              {login.isPending ? (
                <p className="text-sm font-semibold text-muted-foreground">Signing in…</p>
              ) : (
                <GoogleLogin
                  onSuccess={handleSuccess}
                  onError={() => toast.error('Google sign-in cancelled')}
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="pill"
                  width="320"
                />
              )}
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-duo-yellow" />
              <span>Progress syncs across devices</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
