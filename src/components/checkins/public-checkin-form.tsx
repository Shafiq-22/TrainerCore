'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { submitPublicCheckin } from '@/app/checkin/[token]/actions';
import { dictionaries } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils/cn';

function Rating({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              'flex h-11 flex-1 items-center justify-center rounded-lg border text-sm font-semibold transition-colors',
              value === n
                ? 'border-accent bg-accent text-accent-foreground'
                : 'hover:bg-muted',
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PublicCheckinForm({
  token,
  clientName,
  trainerName,
  locale,
}: {
  token: string;
  clientName: string;
  trainerName: string;
  locale: Locale;
}) {
  const t = (k: string) => dictionaries[locale]?.[k] ?? dictionaries.en[k] ?? k;
  const [energy, setEnergy] = useState(3);
  const [sleep, setSleep] = useState(3);
  const [nutrition, setNutrition] = useState(3);
  const [stress, setStress] = useState(3);
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    setLoading(true);
    const res = await submitPublicCheckin(token, {
      energy,
      sleep,
      nutrition,
      stress,
      weight,
      notes,
    });
    setLoading(false);
    if (res.ok) setDone(true);
    else toast.error(res.error);
  }

  if (done) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
            <CheckCircle2 className="h-7 w-7 text-accent" />
          </div>
          <h2 className="text-xl font-bold">{t('checkins.thanks')}</h2>
          <p className="text-sm text-muted-foreground">{t('checkins.thanksBody')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {clientName ? `${clientName}, ` : ''}
          {t('checkins.title')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{t('checkins.intro')}</p>
        <p className="text-xs text-muted-foreground">{trainerName}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-xs text-muted-foreground">{t('checkins.rate')}</p>
        <Rating label={t('checkins.energy')} value={energy} onChange={setEnergy} />
        <Rating label={t('checkins.sleep')} value={sleep} onChange={setSleep} />
        <Rating label={t('checkins.nutrition')} value={nutrition} onChange={setNutrition} />
        <Rating label={t('checkins.stress')} value={stress} onChange={setStress} />
        <div className="space-y-2">
          <Label htmlFor="weight">{t('checkins.weight')}</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cnotes">{t('checkins.notes')}</Label>
          <Textarea id="cnotes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <Button className="w-full" size="lg" onClick={submit} disabled={loading}>
          {loading ? t('common.saving') : t('checkins.submit')}
        </Button>
      </CardContent>
    </Card>
  );
}
