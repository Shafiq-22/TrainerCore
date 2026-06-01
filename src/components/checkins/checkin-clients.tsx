'use client';

import { useTransition } from 'react';
import { Send, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { sendCheckinAction, createCheckinAction } from '@/app/(app)/checkins/actions';
import { Button } from '@/components/ui/button';

export function CheckinClients({
  clients,
}: {
  clients: { id: string; full_name: string; phone: string | null }[];
}) {
  const [pending, start] = useTransition();

  function send(id: string) {
    start(async () => {
      const res = await sendCheckinAction(id);
      if (res.ok) toast.success('Check-in sent');
      else toast.error(res.error);
    });
  }

  async function copyLink(id: string) {
    const res = await createCheckinAction(id);
    if (res.ok && res.data) {
      try {
        await navigator.clipboard.writeText(res.data.link);
        toast.success('Check-in link copied');
      } catch {
        toast.message('Check-in link', { description: res.data.link });
      }
    } else if (!res.ok) {
      toast.error(res.error);
    }
  }

  if (clients.length === 0) {
    return <p className="text-sm text-muted-foreground">No active clients yet.</p>;
  }

  return (
    <div className="divide-y">
      {clients.map((c) => (
        <div key={c.id} className="flex items-center justify-between py-3">
          <span className="text-sm font-medium">{c.full_name}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => copyLink(c.id)}>
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Copy link
            </Button>
            <Button size="sm" onClick={() => send(c.id)} disabled={pending}>
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Send
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
