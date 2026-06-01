import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { CalendarPlus, CalendarDays } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Session } from '@/types';

export default async function ClientSessionsPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data } = await supabase
    .from('sessions')
    .select('*')
    .eq('client_id', params.id)
    .order('starts_at', { ascending: false });
  const sessions = (data ?? []) as Session[];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild size="sm">
          <Link href={`/schedule?client=${params.id}`}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Schedule session
          </Link>
        </Button>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No sessions yet"
          description="Schedule a session for this client from the calendar."
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & time</TableHead>
                <TableHead className="hidden sm:table-cell">Title</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">
                    {format(parseISO(s.starts_at), 'EEE d MMM, h:mm a')}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {s.title ?? 'Training session'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={s.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
