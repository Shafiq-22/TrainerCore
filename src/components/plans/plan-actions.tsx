'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { PlanDownloadButton } from './plan-download-button';
import { assignPlanAction, deletePlanAction } from '@/app/(app)/plans/actions';
import type { PlanPdfData } from '@/lib/pdf/plan-pdf';

export function PlanActions({
  planId,
  pdfData,
  clients,
}: {
  planId: string;
  pdfData: PlanPdfData;
  clients: { id: string; full_name: string }[];
}) {
  const router = useRouter();
  const [assignOpen, setAssignOpen] = useState(false);
  const [clientId, setClientId] = useState('');
  const [pending, start] = useTransition();

  function assign() {
    if (!clientId) return;
    start(async () => {
      const res = await assignPlanAction(clientId, planId);
      if (res.ok) {
        toast.success('Plan assigned to client');
        setAssignOpen(false);
        router.refresh();
      } else toast.error(res.error);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <PlanDownloadButton data={pdfData} />
      <Button variant="outline" size="sm" onClick={() => setAssignOpen(true)}>
        <UserPlus className="mr-2 h-4 w-4" />
        Assign
      </Button>
      <ConfirmDialog
        destructive
        title="Delete this plan?"
        description="This permanently removes the plan and unassigns it from any clients."
        confirmLabel="Delete"
        onConfirm={async () => {
          const res = await deletePlanAction(planId);
          if (res.ok) {
            toast.success('Plan deleted');
            router.push('/plans');
            router.refresh();
          } else toast.error(res.error);
        }}
        trigger={
          <Button variant="outline" size="sm" aria-label="Delete plan">
            <Trash2 className="h-4 w-4" />
          </Button>
        }
      />

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign plan to a client</DialogTitle>
          </DialogHeader>
          {clients.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You have no active clients to assign this plan to.
            </p>
          ) : (
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <DialogFooter>
            <Button onClick={assign} disabled={!clientId || pending}>
              {pending ? 'Assigning…' : 'Assign plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
