'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateBusinessAction } from '@/app/(app)/settings/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export function BusinessForm({
  businessName,
  vatNumber,
  vatRegistered,
  address,
}: {
  businessName: string;
  vatNumber: string;
  vatRegistered: boolean;
  address: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(businessName);
  const [vat, setVat] = useState(vatNumber);
  const [registered, setRegistered] = useState(vatRegistered);
  const [addr, setAddr] = useState(address);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    const res = await updateBusinessAction({
      businessName: name,
      vatNumber: vat,
      vatRegistered: registered,
      address: addr,
    });
    setLoading(false);
    if (res.ok) {
      toast.success('Business details updated');
      router.refresh();
    } else toast.error(res.error);
  }

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div className="space-y-2">
          <Label htmlFor="bn">Business name</Label>
          <Input id="bn" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="addr">Address</Label>
          <Textarea id="addr" rows={2} value={addr} onChange={(e) => setAddr(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vat">VAT registration number</Label>
          <Input id="vat" value={vat} onChange={(e) => setVat(e.target.value)} />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">VAT registered</p>
            <p className="text-xs text-muted-foreground">Adds 5% VAT to new invoices by default.</p>
          </div>
          <Switch checked={registered} onCheckedChange={setRegistered} />
        </div>
        <Button onClick={save} disabled={loading}>
          {loading ? 'Saving…' : 'Save business details'}
        </Button>
      </CardContent>
    </Card>
  );
}
