'use client';

import { dictionaries } from '@/lib/i18n/dictionaries';

/**
 * The app is English-only. This provider is a passthrough kept so existing
 * `useTranslation()` call sites continue to work without changes.
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useTranslation() {
  return {
    t: (key: string, fallback?: string) => dictionaries.en[key] ?? fallback ?? key,
  };
}
