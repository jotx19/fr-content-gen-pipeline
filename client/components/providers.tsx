'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from '@/components/theme-provider';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <GoogleOAuthProvider clientId={googleClientId}>{children}</GoogleOAuthProvider>
    </ThemeProvider>
  );
}
