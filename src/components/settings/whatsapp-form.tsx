'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { updateWhatsappAction } from '@/app/(app)/settings/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export function WhatsappForm({
  enabled,
  configured,
}: {
  enabled: boolean;
  configured: boolean;
}) {
  const router = useRouter();
  const [on, setOn] = useState(enabled);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    const res = await updateWhatsappAction({ whatsappEnabled: on });
    setLoading(false);
    if (res.ok) {
      toast.success('WhatsApp settings saved');
      router.refresh();
    } else toast.error(res.error);
  }

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div
          className={
            configured
              ? 'flex items-start gap-3 rounded-lg border border-success/40 bg-success/10 p-4 text-sm'
              : 'flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm'
          }
        >
          {configured ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          )}
          <div>
            <p className="font-medium">
              {configured ? 'Twilio WhatsApp connected' : 'Twilio not configured'}
            </p>
            <p className="text-muted-foreground">
              {configured
                ? 'Messages will be delivered through your Twilio WhatsApp sender.'
                : 'Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_WHATSAPP_NUMBER to your environment to enable delivery. Until then, messages are logged and recorded in the activity feed.'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Enable WhatsApp messages</p>
            <p className="text-xs text-muted-foreground">
              Check-in links, session reminders and invoice notifications.
            </p>
          </div>
          <Switch checked={on} onCheckedChange={setOn} />
        </div>

        <Button onClick={save} disabled={loading}>
          {loading ? 'Saving…' : 'Save'}
        </Button>
      </CardContent>
    </Card>
  );
}
