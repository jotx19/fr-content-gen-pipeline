'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { GOOGLE_CLIENT_ID } from '@/lib/google-client-id';
import { getQueryClient } from '@/lib/query/get-query-client';
import { useAuthBootstrapQuery } from '@/modules/auth/hooks/use-auth-query';
import { CustomToaster } from '@/components/ui/sonner';

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  useAuthBootstrapQuery();
  return children;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
        storageKey="fringo-theme"
      >
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <AuthBootstrap>{children}</AuthBootstrap>
          <CustomToaster />
        </GoogleOAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
