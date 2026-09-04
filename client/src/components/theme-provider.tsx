'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';

/**
 * React 19 warns when next-themes renders an executable <script> in the client tree.
 * FOUC prevention runs from ThemeScript in layout <head>; this provider skips that script.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      {...props}
      scriptProps={{ type: 'application/json', suppressHydrationWarning: true }}
    >
      {children}
    </NextThemesProvider>
  );
}
