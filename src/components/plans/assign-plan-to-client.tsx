'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { assignPlanAction, unassignPlanAction } from '@/app/(app)/plans/actions';

export function AssignPlanToClient({
  clientId,
  plans,
  hasActive,
}: {
  clientId: string;
  plans: { id: string; name: string }[];
  hasActive: boolean;
}) {
  const router = useRouter();
  const [planId, setPlanId] = useState('');
  const [pending, start] = useTransition();

  function assign() {
    if (!planId) return;
    start(async () => {
      const res = await assignPlanAction(clientId, planId);
      if (res.ok) {
        toast.success('Plan assigned');
        router.refresh();
      } else toast.error(res.error);
    });
  }

  function unassign() {
    start(async () => {
      const res = await unassignPlanAction(clientId);
      if (res.ok) {
        toast.success('Plan removed');
        router.refresh();
      } else toast.error(res.error);
    });
  }

  if (plans.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Create a workout plan first, then assign it here.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={planId} onValueChange={setPlanId}>
        <SelectTrigger className="w-full sm:w-64">
          <SelectValue placeholder="Choose a plan" />
        </SelectTrigger>
        <SelectContent>
          {plans.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={assign} disabled={!planId || pending}>
        {hasActive ? 'Replace plan' : 'Assign plan'}
      </Button>
      {hasActive && (
        <Button variant="outline" onClick={unassign} disabled={pending}>
          Remove
        </Button>
      )}
    </div>
  );
}
