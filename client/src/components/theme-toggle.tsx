'use client';

import { Moon, Sun } from '@/components/icons';
import { glassButtonPill } from '@/lib/glass-button-styles';
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
        'pointer-events-auto h-9 w-9 text-foreground/80 hover:text-foreground/90 dark:text-white/80 dark:hover:text-white/90',
        glassButtonPill,
        className,
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
