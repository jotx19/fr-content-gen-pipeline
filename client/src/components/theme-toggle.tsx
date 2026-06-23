'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
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
        'pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/80 text-foreground transition-colors hover:bg-muted',
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

export function ThemeToggleMenuItem() {
  const { isDark, toggle, mounted } = useThemeToggle();

  return (
    <DropdownMenuItem onClick={toggle} className="cursor-pointer">
      {mounted && isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {mounted && isDark ? 'Light mode' : 'Dark mode'}
    </DropdownMenuItem>
  );
}
