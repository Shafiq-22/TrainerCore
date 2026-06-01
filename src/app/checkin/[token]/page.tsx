import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { Logo } from '@/components/shared/logo';
import { Card, CardContent } from '@/components/ui/card';
import { PublicCheckinForm } from '@/components/checkins/public-checkin-form';
import { dictionaries } from '@/lib/i18n/dictionaries';
import { dir, isLocale, type Locale } from '@/lib/i18n/config';

export const metadata: Metadata = { title: 'Weekly check-in' };

interface CheckinInfo {
  found: boolean;
  status?: string;
  expired?: boolean;
  client_name?: string;
  trainer_name?: string;
  trainer_locale?: string;
}

export default async function PublicCheckinPage({ params }: { params: { token: string } }) {
  const supabase = createClient();
  const { data } = await supabase.rpc('get_checkin', { p_token: params.token });
  const info = data as CheckinInfo | null;

  const locale: Locale = isLocale(info?.trainer_locale) ? (info!.trainer_locale as Locale) : 'en';
  const t = (k: string) => dictionaries[locale]?.[k] ?? dictionaries.en[k] ?? k;
  const invalid = !info?.found || info.status !== 'pending' || Boolean(info.expired);

  return (
    <div dir={dir(locale)} className="min-h-screen bg-muted/30">
      <div className="mx-auto w-full max-w-md px-4 py-10">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        {invalid ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              {t('checkins.invalid')}
            </CardContent>
          </Card>
        ) : (
          <PublicCheckinForm
            token={params.token}
            clientName={info?.client_name ?? ''}
            trainerName={info?.trainer_name ?? ''}
            locale={locale}
          />
        )}
      </div>
    </div>
  );
}
