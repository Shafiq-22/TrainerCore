'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createSessionAction,
  updateSessionAction,
  setSessionStatusAction,
  deleteSessionAction,
} from '@/app/(app)/schedule/actions';

export interface EditableSession {
  id: string;
  client_id: string;
  starts_at: string;
  ends_at: string;
  title: string | null;
  location: string | null;
  notes: string | null;
  status: string;
}

function utcTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}
function utcDate(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}
function durationOf(a: string, b: string) {
  return String(Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000));
}

export function SessionDialog({
  open,
  onOpenChange,
  clients,
  session,
  defaultDate,
  defaultTime,
  defaultClientId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: { id: string; full_name: string }[];
  session?: EditableSession | null;
  defaultDate?: string;
  defaultTime?: string;
  defaultClientId?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [clientId, setClientId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState('60');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open) return;
    if (session) {
      setClientId(session.client_id);
      setDate(utcDate(session.starts_at));
      setTime(utcTime(session.starts_at));
      setDuration(durationOf(session.starts_at, session.ends_at));
      setTitle(session.title ?? '');
      setLocation(session.location ?? '');
      setNotes(session.notes ?? '');
    } else {
      setClientId(defaultClientId ?? '');
      setDate(defaultDate ?? new Date().toISOString().slice(0, 10));
      setTime(defaultTime ?? '09:00');
      setDuration('60');
      setTitle('');
      setLocation('');
      setNotes('');
    }
  }, [open, session, defaultDate, defaultTime, defaultClientId]);

  const payload = () => ({
    clientId,
    date,
    startTime: time,
    durationMin: duration,
    title,
    location,
    notes,
  });

  function save() {
    start(async () => {
      const res = session
        ? await updateSessionAction(session.id, payload())
        : await createSessionAction(payload());
      if (res.ok) {
        toast.success(session ? 'Session updated' : 'Session scheduled');
        onOpenChange(false);
        router.refresh();
      } else toast.error(res.error);
    });
  }

  function setStatus(status: 'completed' | 'canceled') {
    if (!session) return;
    start(async () => {
      const res = await setSessionStatusAction(session.id, status);
      if (res.ok) {
        toast.success(status === 'completed' ? 'Marked complete' : 'Session cancelled');
        onOpenChange(false);
        router.refresh();
      } else toast.error(res.error);
    });
  }

  function remove() {
    if (!session) return;
    start(async () => {
      const res = await deleteSessionAction(session.id);
      if (res.ok) {
        toast.success('Session deleted');
        onOpenChange(false);
        router.refresh();
      } else toast.error(res.error);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{session ? 'Edit session' : 'New session'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Client</Label>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Start time</Label>
              <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Upper body strength"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Fitness First, Marina"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="snotes">Notes</Label>
            <Textarea id="snotes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          {session ? (
            <div className="flex gap-2">
              {session.status !== 'completed' && (
                <Button variant="outline" size="sm" onClick={() => setStatus('completed')} disabled={pending}>
                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  Complete
                </Button>
              )}
              {session.status !== 'canceled' && (
                <Button variant="outline" size="sm" onClick={() => setStatus('canceled')} disabled={pending}>
                  <XCircle className="mr-1.5 h-4 w-4" />
                  Cancel
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={remove} disabled={pending} aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <span />
          )}
          <Button onClick={save} disabled={pending || !clientId}>
            {pending ? 'Saving…' : session ? 'Save' : 'Schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
