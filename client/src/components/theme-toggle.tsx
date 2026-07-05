'use client';

import { Moon, Sun } from '@/components/icons';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function useThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';
  const toggle = () => setTheme(isDark ? 'light' : 'dark');

  return { isDark, toggle, mounted };
}

export function ThemeToggleButton({ className }: { className?: string }) {
  const { isDark, toggle, mounted } = useThemeToggle();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/80 text-foreground/80 transition-colors hover:bg-white/90 hover:text-foreground/90 dark:border-white/15 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15 dark:hover:text-white/90',
        className
      )}
    >
      {!mounted ? (
        <span className="h-4 w-4" aria-hidden />
      ) : isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
