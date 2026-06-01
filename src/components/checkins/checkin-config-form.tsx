'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { updateCheckinConfigAction } from '@/app/(app)/checkins/actions';
import { WEEKDAY_LABELS } from '@/lib/utils/dates';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function CheckinConfigForm({
  dayOfWeek,
  enabled,
}: {
  dayOfWeek: number;
  enabled: boolean;
}) {
  const [day, setDay] = useState(String(dayOfWeek));
  const [on, setOn] = useState(enabled);
  const [pending, start] = useTransition();

  function save() {
    start(async () => {
      const res = await updateCheckinConfigAction({ dayOfWeek: Number(day), enabled: on });
      if (res.ok) toast.success('Check-in settings saved');
      else toast.error(res.error);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <p className="text-sm font-medium">Automated weekly check-ins</p>
          <p className="text-xs text-muted-foreground">
            Sends a check-in link to active clients each week.
          </p>
        </div>
        <Switch checked={on} onCheckedChange={setOn} />
      </div>
      <div className="space-y-2">
        <Label>Day of week</Label>
        <Select value={day} onValueChange={setDay}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WEEKDAY_LABELS.map((label, i) => (
              <SelectItem key={i} value={String(i)}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={save} disabled={pending}>
        {pending ? 'Saving…' : 'Save settings'}
      </Button>
    </div>
  );
}
