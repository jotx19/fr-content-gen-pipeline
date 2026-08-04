'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  'aria-label'?: string;
};

/** iOS-style on/off switch */
export function Switch({
  checked,
  onCheckedChange,
  disabled,
  'aria-label': ariaLabel,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-[31px] w-[51px] shrink-0 items-center rounded-full transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-[#34C759]' : 'bg-black/15 dark:bg-white/20',
      )}
    >
      <span
        className={cn(
          'pointer-events-none absolute top-[2px] left-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-sm',
          'transition-transform duration-200 ease-out',
          checked && 'translate-x-[20px]',
        )}
      />
    </button>
  );
}

const PREFS_KEY = 'fringo-settings';

export type AppSettingsPrefs = {
  language: 'en' | 'fr';
  soundEffects: boolean;
  celebrations: boolean;
  reduceMotion: boolean;
  writingLevelPref: string | null;
};

const DEFAULT_PREFS: AppSettingsPrefs = {
  language: 'en',
  soundEffects: true,
  celebrations: true,
  reduceMotion: false,
  writingLevelPref: null,
};

export function loadSettingsPrefs(): AppSettingsPrefs {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function saveSettingsPrefs(prefs: AppSettingsPrefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

export function useSettingsPrefs() {
  const [prefs, setPrefs] = useState<AppSettingsPrefs>(DEFAULT_PREFS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPrefs(loadSettingsPrefs());
    setMounted(true);
  }, []);

  const update = (partial: Partial<AppSettingsPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...partial };
      saveSettingsPrefs(next);
      return next;
    });
  };

  return { prefs, update, mounted };
}
