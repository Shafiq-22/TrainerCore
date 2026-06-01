'use client';

import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteMeasurementAction } from '@/app/(app)/clients/[id]/progress/actions';
import { formatDate } from '@/lib/utils/dates';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Measurement } from '@/types';

export function MeasurementHistory({
  clientId,
  measurements,
}: {
  clientId: string;
  measurements: Measurement[];
}) {
  const router = useRouter();

  if (measurements.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No measurements yet. Add one to start tracking progress.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Weight</TableHead>
          <TableHead>Body fat</TableHead>
          <TableHead className="hidden sm:table-cell">Waist</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {measurements.map((m) => (
          <TableRow key={m.id}>
            <TableCell className="font-medium">{formatDate(m.measured_on)}</TableCell>
            <TableCell>{m.weight_kg ? `${m.weight_kg} kg` : '—'}</TableCell>
            <TableCell>{m.body_fat_pct ? `${m.body_fat_pct}%` : '—'}</TableCell>
            <TableCell className="hidden sm:table-cell">
              {m.waist_cm ? `${m.waist_cm} cm` : '—'}
            </TableCell>
            <TableCell>
              <ConfirmDialog
                title="Delete measurement?"
                description="This will remove this measurement record."
                confirmLabel="Delete"
                destructive
                onConfirm={async () => {
                  const res = await deleteMeasurementAction(m.id, clientId);
                  if (res.ok) {
                    toast.success('Measurement deleted');
                    router.refresh();
                  } else toast.error(res.error);
                }}
                trigger={
                  <Button variant="ghost" size="icon" aria-label="Delete measurement">
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                }
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
