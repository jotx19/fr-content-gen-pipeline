'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { en, type Messages } from './en';
import { fr } from './fr';
import {
  LOCALE_EVENT,
  persistLocale,
  readStoredLocale,
  type Locale,
} from './storage';

const DICTS: Record<Locale, Messages> = { en, fr };

type Vars = Record<string, string | number>;

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  m: Messages;
  t: (path: string, vars?: Vars) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function interpolate(template: string, vars?: Vars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] == null ? `{${key}}` : String(vars[key]),
  );
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const stored = readStoredLocale();
    setLocaleState(stored);
    document.documentElement.lang = stored;

    const onCustom = (event: Event) => {
      const next = (event as CustomEvent<Locale>).detail;
      if (next === 'en' || next === 'fr') setLocaleState(next);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'fringo-language' && (event.newValue === 'en' || event.newValue === 'fr')) {
        setLocaleState(event.newValue);
        document.documentElement.lang = event.newValue;
      }
    };
    window.addEventListener(LOCALE_EVENT, onCustom);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(LOCALE_EVENT, onCustom);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    persistLocale(next);
  }, []);

  const m = DICTS[locale];

  const t = useCallback(
    (path: string, vars?: Vars) => {
      const value = getPath(m, path);
      if (typeof value !== 'string') return path;
      return interpolate(value, vars);
    },
    [m],
  );

  const value = useMemo(
    () => ({ locale, setLocale, m, t }),
    [locale, setLocale, m, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}

export function useLocaleDate() {
  const { locale } = useI18n();
  return useCallback(
    (value?: string | null, fallback = '') => {
      if (!value) return fallback;
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return fallback;
      return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(d);
    },
    [locale],
  );
}
