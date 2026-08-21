export type Locale = 'en' | 'fr';

export const LANG_KEY = 'fringo-language';
export const PREFS_KEY = 'fringo-settings';
export const LOCALE_EVENT = 'fringo-locale';

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'fr';
}

export function readStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  try {
    const direct = localStorage.getItem(LANG_KEY);
    if (isLocale(direct)) return direct;
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      const prefs = JSON.parse(raw) as { language?: unknown };
      if (isLocale(prefs.language)) return prefs.language;
    }
  } catch {
    /* ignore */
  }
  return 'en';
}

export function persistLocale(locale: Locale) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LANG_KEY, locale);
    const raw = localStorage.getItem(PREFS_KEY);
    const prefs = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...prefs, language: locale }));
  } catch {
    /* ignore */
  }
  document.documentElement.lang = locale;
  window.dispatchEvent(new CustomEvent(LOCALE_EVENT, { detail: locale }));
}
