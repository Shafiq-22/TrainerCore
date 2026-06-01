'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function UpgradeModal({
  open,
  onOpenChange,
  current,
  limit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current?: number;
  limit?: number;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
          <DialogTitle>Client limit reached</DialogTitle>
          <DialogDescription>
            {typeof current === 'number' && typeof limit === 'number'
              ? `You're using ${current} of ${limit} clients on your current plan. `
              : ''}
            Upgrade to add more clients and unlock additional features.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Not now
          </Button>
          <Button asChild>
            <Link href="/subscription">View plans</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
