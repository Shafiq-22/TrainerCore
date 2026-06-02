'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { clientFormSchema, type ClientFormValues } from '@/lib/validators/client';
import { createClientAction, updateClientAction } from '@/app/(app)/clients/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NumericInput } from '@/components/shared/numeric-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Client } from '@/types';

const CLIENT_COLORS = ['#22C55E', '#3B82F6', '#A855F7', '#F59E0B', '#EF4444', '#14B8A6'];

export function ClientForm({ client }: { client?: Client }) {
  const router = useRouter();
  const isEdit = Boolean(client);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      fullName: client?.full_name ?? '',
      email: client?.email ?? '',
      phone: client?.phone ?? '',
      gender: client?.gender ?? '',
      dateOfBirth: client?.date_of_birth ?? '',
      heightCm: client?.height_cm?.toString() ?? '',
      goal: client?.goal ?? '',
      packageName: client?.package_name ?? '',
      packageSessions: client?.package_sessions?.toString() ?? '',
      packagePrice: client?.package_price?.toString() ?? '',
      medicalNotes: client?.medical_notes ?? '',
      notes: client?.notes ?? '',
      status: client?.status ?? 'active',
      color: client?.color ?? '#22C55E',
    },
  });

  const color = watch('color');

  async function onSubmit(values: ClientFormValues) {
    setLoading(true);
    const res = isEdit
      ? await updateClientAction(client!.id, values)
      : await createClientAction(values);
    setLoading(false);

    if (res.ok) {
      toast.success(isEdit ? 'Client updated' : 'Client added');
      const id = isEdit ? client!.id : res.data?.id;
      router.push(`/clients/${id}`);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" {...register('fullName')} />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (WhatsApp)</Label>
            <Input id="phone" placeholder="+971 50 123 4567" {...register('phone')} />
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select
              value={watch('gender') || undefined}
              onValueChange={(v) => setValue('gender', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of birth</Label>
            <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="heightCm">Height (cm)</Label>
            <NumericInput id="heightCm" {...register('heightCm')} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Calendar colour</Label>
            <div className="flex gap-2">
              {CLIENT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue('color', c)}
                  aria-label={`Colour ${c}`}
                  className="h-8 w-8 rounded-full border-2 transition-transform"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? '#0F172A' : 'transparent',
                    transform: color === c ? 'scale(1.1)' : 'none',
                  }}
                />
              ))}
              <label
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40 text-xs text-muted-foreground"
                title="Pick any colour"
                style={{ backgroundColor: CLIENT_COLORS.includes(color) ? undefined : color }}
              >
                {CLIENT_COLORS.includes(color) ? '+' : ''}
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setValue('color', e.target.value)}
                  aria-label="Custom calendar colour"
                  className="sr-only"
                />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Training & package</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="goal">Goal</Label>
            <Textarea id="goal" rows={2} {...register('goal')} placeholder="e.g. Lose 8kg, build strength" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="packageName">Package name</Label>
            <Input id="packageName" placeholder="e.g. 12-session pack" {...register('packageName')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="packageSessions">Sessions in package</Label>
            <NumericInput id="packageSessions" {...register('packageSessions')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="packagePrice">Package price (AED)</Label>
            <NumericInput id="packagePrice" {...register('packagePrice')} />
          </div>
          {isEdit && (
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(v) => setValue('status', v as ClientFormValues['status'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="medicalNotes">Medical notes</Label>
            <Textarea id="medicalNotes" rows={2} {...register('medicalNotes')} placeholder="Injuries, conditions, allergies…" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">General notes</Label>
            <Textarea id="notes" rows={2} {...register('notes')} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Add client'}
        </Button>
      </div>
    </form>
  );
}
