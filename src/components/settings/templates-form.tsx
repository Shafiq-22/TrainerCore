'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateTemplatesAction } from '@/app/(app)/settings/actions';
import {
  TEMPLATE_KEYS,
  TEMPLATE_VARIABLES,
  normalizeTemplates,
  type MessageTemplates,
  type TemplateKey,
} from '@/lib/notifications/templates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const LABELS: Record<TemplateKey, string> = {
  checkin: 'Weekly check-in',
  session_reminder: 'Session reminder',
  invoice_sent: 'Invoice sent',
};

export function TemplatesForm({ initial }: { initial: unknown }) {
  const router = useRouter();
  const [templates, setTemplates] = useState<MessageTemplates>(normalizeTemplates(initial));
  const [loading, setLoading] = useState(false);

  function set(key: TemplateKey, value: string) {
    setTemplates((t) => ({ ...t, [key]: value }));
  }

  async function save() {
    setLoading(true);
    const res = await updateTemplatesAction(templates);
    setLoading(false);
    if (res.ok) {
      toast.success('Templates saved');
      router.refresh();
    } else toast.error(res.error);
  }

  return (
    <div className="space-y-4">
      {TEMPLATE_KEYS.map((key) => (
        <Card key={key}>
          <CardHeader>
            <CardTitle className="text-base">{LABELS[key]}</CardTitle>
            <p className="text-xs text-muted-foreground">
              Variables: {TEMPLATE_VARIABLES[key].map((v) => `{{${v}}}`).join(', ')}
            </p>
          </CardHeader>
          <CardContent>
            <Label className="sr-only">Message</Label>
            <Textarea rows={3} value={templates[key]} onChange={(e) => set(key, e.target.value)} />
          </CardContent>
        </Card>
      ))}
      <Button onClick={save} disabled={loading}>
        {loading ? 'Saving…' : 'Save templates'}
      </Button>
    </div>
  );
}
