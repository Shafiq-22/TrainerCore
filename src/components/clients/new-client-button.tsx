'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UpgradeModal } from '@/components/shared/upgrade-modal';

export function NewClientButton({
  allowed,
  current,
  limit,
}: {
  allowed: boolean;
  current: number;
  limit: number;
}) {
  const [open, setOpen] = useState(false);

  if (allowed) {
    return (
      <Button asChild>
        <Link href="/clients/new">
          <Plus className="mr-2 h-4 w-4" />
          New client
        </Link>
      </Button>
    );
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        New client
      </Button>
      <UpgradeModal open={open} onOpenChange={setOpen} current={current} limit={limit} />
    </>
  );
}
