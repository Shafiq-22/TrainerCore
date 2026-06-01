'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { dictionaries } from '@/lib/i18n/dictionaries';
import { DEFAULT_LOCALE, LOCALE_COOKIE, dir, type Locale } from '@/lib/i18n/config';

interface I18nContextValue {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  t: (key: string, fallback?: string) => string;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const applyLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof document !== 'undefined') {
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = next;
      document.documentElement.dir = dir(next);
    }
  }, []);

  const t = useCallback(
    (key: string, fallback?: string) => {
      return dictionaries[locale]?.[key] ?? dictionaries.en[key] ?? fallback ?? key;
    },
    [locale],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      dir: dir(locale),
      t,
      setLocale: applyLocale,
      toggleLocale: () => applyLocale(locale === 'en' ? 'ar' : 'en'),
    }),
    [locale, t, applyLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return ctx;
}
