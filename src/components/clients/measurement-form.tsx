'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { measurementFormSchema, type MeasurementFormValues } from '@/lib/validators/client';
import { addMeasurementAction } from '@/app/(app)/clients/[id]/progress/actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { NumericInput } from '@/components/shared/numeric-input';

export function MeasurementForm({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MeasurementFormValues>({
    resolver: zodResolver(measurementFormSchema),
    defaultValues: { measuredOn: format(new Date(), 'yyyy-MM-dd') },
  });

  async function onSubmit(values: MeasurementFormValues) {
    setLoading(true);
    const res = await addMeasurementAction(clientId, values);
    setLoading(false);
    if (res.ok) {
      toast.success('Measurement added');
      setOpen(false);
      reset({ measuredOn: format(new Date(), 'yyyy-MM-dd') });
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add measurement
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add measurement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="measuredOn">Date</Label>
            <Input id="measuredOn" type="date" {...register('measuredOn')} />
            {errors.measuredOn && (
              <p className="text-xs text-destructive">{errors.measuredOn.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weightKg">Weight (kg)</Label>
              <NumericInput id="weightKg" {...register('weightKg')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bodyFatPct">Body fat (%)</Label>
              <NumericInput id="bodyFatPct" {...register('bodyFatPct')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chestCm">Chest (cm)</Label>
              <NumericInput id="chestCm" {...register('chestCm')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waistCm">Waist (cm)</Label>
              <NumericInput id="waistCm" {...register('waistCm')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hipsCm">Hips (cm)</Label>
              <NumericInput id="hipsCm" {...register('hipsCm')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="armCm">Arm (cm)</Label>
              <NumericInput id="armCm" {...register('armCm')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={2} {...register('notes')} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Save measurement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
