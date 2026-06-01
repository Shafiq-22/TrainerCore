'use client';

import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/components/providers/i18n-provider';

export function LangToggle({
  variant = 'ghost',
}: {
  variant?: 'ghost' | 'outline';
}) {
  const { locale, toggleLocale } = useTranslation();
  return (
    <Button
      variant={variant}
      size="sm"
      onClick={toggleLocale}
      aria-label="Toggle language"
      className="gap-2"
    >
      <Languages className="h-4 w-4" />
      {locale === 'en' ? 'العربية' : 'English'}
    </Button>
  );
}
