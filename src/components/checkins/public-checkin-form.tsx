'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { submitPublicCheckin } from '@/app/checkin/[token]/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { NumericInput } from '@/components/shared/numeric-input';
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
}: {
  token: string;
  clientName: string;
  trainerName: string;
}) {
  const [energy, setEnergy] = useState(3);
  const [sleep, setSleep] = useState(3);
  const [nutrition, setNutrition] = useState(3);
  const [stress, setStress] = useState(3);
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [waist, setWaist] = useState('');
  const [chest, setChest] = useState('');
  const [hips, setHips] = useState('');
  const [arm, setArm] = useState('');
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
      bodyFat,
      chest,
      waist,
      hips,
      arm,
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
          <h2 className="text-xl font-bold">Thank you!</h2>
          <p className="text-sm text-muted-foreground">
            Your check-in has been recorded. Keep up the great work!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {clientName ? `${clientName}, ` : ''}weekly check-in
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your weekly check-in helps your trainer support you better.
        </p>
        <p className="text-xs text-muted-foreground">{trainerName}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-xs text-muted-foreground">Rate from 1 (low) to 5 (high)</p>
        <Rating label="Energy" value={energy} onChange={setEnergy} />
        <Rating label="Sleep" value={sleep} onChange={setSleep} />
        <Rating label="Nutrition" value={nutrition} onChange={setNutrition} />
        <Rating label="Stress" value={stress} onChange={setStress} />

        <div className="space-y-3 rounded-lg border p-3">
          <p className="text-sm font-medium">Body measurements (optional)</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="weight">Weight (kg)</Label>
              <NumericInput id="weight" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="bodyFat">Body fat (%)</Label>
              <NumericInput id="bodyFat" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="waist">Waist (cm)</Label>
              <NumericInput id="waist" value={waist} onChange={(e) => setWaist(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="chest">Chest (cm)</Label>
              <NumericInput id="chest" value={chest} onChange={(e) => setChest(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="hips">Hips (cm)</Label>
              <NumericInput id="hips" value={hips} onChange={(e) => setHips(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="arm">Arm (cm)</Label>
              <NumericInput id="arm" value={arm} onChange={(e) => setArm(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cnotes">Anything you want to share?</Label>
          <Textarea id="cnotes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <Button className="w-full" size="lg" onClick={submit} disabled={loading}>
          {loading ? 'Saving…' : 'Submit check-in'}
        </Button>
      </CardContent>
    </Card>
  );
}
