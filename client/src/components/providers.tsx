'use client';

import { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { GOOGLE_CLIENT_ID } from '@/lib/google-client-id';
import { getQueryClient } from '@/lib/query/get-query-client';
import { useAuthBootstrapQuery } from '@/modules/auth/hooks/use-auth-query';
import { useAuthStore } from '@/store/authStore';
import { CustomToaster } from '@/components/ui/sonner';
import { I18nProvider } from '@/lib/i18n';

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const finish = () => useAuthStore.getState().setHasHydrated(true);
    if (useAuthStore.persist.hasHydrated()) {
      finish();
    }
    return useAuthStore.persist.onFinishHydration(finish);
  }, []);

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
          <I18nProvider>
            <AuthBootstrap>{children}</AuthBootstrap>
            <CustomToaster />
          </I18nProvider>
        </GoogleOAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
