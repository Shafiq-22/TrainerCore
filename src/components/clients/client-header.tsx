import Link from 'next/link';
import { Pencil, CalendarPlus, ReceiptText } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import type { Client } from '@/types';

export function ClientHeader({ client }: { client: Client }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14">
          {client.avatar_url && <AvatarImage src={client.avatar_url} alt={client.full_name} />}
          <AvatarFallback style={{ backgroundColor: client.color, color: 'white' }}>
            {client.full_name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{client.full_name}</h1>
            <StatusBadge status={client.status} />
          </div>
          {client.goal && (
            <p className="text-sm text-muted-foreground">{client.goal}</p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/billing/new?client=${client.id}`}>
            <ReceiptText className="mr-2 h-4 w-4" />
            Invoice
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/schedule?client=${client.id}`}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Schedule
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/clients/${client.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>
    </div>
  );
}
