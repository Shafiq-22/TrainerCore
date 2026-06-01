'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { createInvoiceAction, updateInvoiceAction } from '@/app/(app)/billing/actions';
import { computeInvoiceTotals, VAT_RATE, formatAED } from '@/lib/utils/money';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Invoice, InvoiceLineItem } from '@/types';

interface Row {
  description: string;
  quantity: string;
  unitPrice: string;
}

export function InvoiceForm({
  clients,
  defaultClientId,
  defaultVat,
  invoice,
}: {
  clients: { id: string; full_name: string }[];
  defaultClientId?: string;
  defaultVat: boolean;
  invoice?: Invoice;
}) {
  const router = useRouter();
  const isEdit = Boolean(invoice);
  const [loading, setLoading] = useState(false);

  const existingItems = (invoice?.line_items as unknown as InvoiceLineItem[] | null) ?? null;

  const [clientId, setClientId] = useState(invoice?.client_id ?? defaultClientId ?? '');
  const [issueDate, setIssueDate] = useState(
    invoice?.issue_date ?? format(new Date(), 'yyyy-MM-dd'),
  );
  const [dueDate, setDueDate] = useState(invoice?.due_date ?? '');
  const [notes, setNotes] = useState(invoice?.notes ?? '');
  const [vatEnabled, setVatEnabled] = useState(
    invoice ? Number(invoice.vat_rate) > 0 : defaultVat,
  );
  const [rows, setRows] = useState<Row[]>(
    existingItems && existingItems.length > 0
      ? existingItems.map((li) => ({
          description: li.description,
          quantity: String(li.quantity),
          unitPrice: String(li.unit_price),
        }))
      : [{ description: '', quantity: '1', unitPrice: '' }],
  );

  const totals = useMemo(() => {
    const items: InvoiceLineItem[] = rows.map((r) => ({
      description: r.description,
      quantity: Number(r.quantity) || 0,
      unit_price: Number(r.unitPrice) || 0,
    }));
    return computeInvoiceTotals(items, vatEnabled ? VAT_RATE : 0);
  }, [rows, vatEnabled]);

  function updateRow(i: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function addRow() {
    setRows((rs) => [...rs, { description: '', quantity: '1', unitPrice: '' }]);
  }
  function removeRow(i: number) {
    setRows((rs) => (rs.length > 1 ? rs.filter((_, idx) => idx !== i) : rs));
  }

  async function submit() {
    const lineItems = rows
      .filter((r) => r.description.trim())
      .map((r) => ({
        description: r.description.trim(),
        quantity: Number(r.quantity) || 0,
        unitPrice: Number(r.unitPrice) || 0,
      }));
    if (!clientId) return toast.error('Select a client');
    if (lineItems.length === 0) return toast.error('Add at least one line item');

    setLoading(true);
    const input = { clientId, issueDate, dueDate, notes, vatEnabled, lineItems };
    const res = isEdit
      ? await updateInvoiceAction(invoice!.id, input)
      : await createInvoiceAction(input);
    setLoading(false);

    if (res.ok) {
      toast.success(isEdit ? 'Invoice updated' : 'Invoice created');
      const id = isEdit ? invoice!.id : res.data?.id;
      router.push(`/billing/${id}`);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invoice details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
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
          <div className="space-y-2">
            <Label htmlFor="issueDate">Issue date</Label>
            <Input
              id="issueDate"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due date</Label>
            <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Line items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <Input
                className="col-span-12 sm:col-span-6"
                placeholder="Description"
                value={row.description}
                onChange={(e) => updateRow(i, { description: e.target.value })}
              />
              <Input
                className="col-span-4 sm:col-span-2"
                type="number"
                placeholder="Qty"
                value={row.quantity}
                onChange={(e) => updateRow(i, { quantity: e.target.value })}
              />
              <Input
                className="col-span-5 sm:col-span-3"
                type="number"
                step="0.01"
                placeholder="Unit price"
                value={row.unitPrice}
                onChange={(e) => updateRow(i, { unitPrice: e.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="col-span-3 sm:col-span-1"
                onClick={() => removeRow(i)}
                aria-label="Remove line"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            <Plus className="mr-2 h-4 w-4" />
            Add line
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Add 5% VAT</p>
              <p className="text-xs text-muted-foreground">UAE standard rate</p>
            </div>
            <Switch checked={vatEnabled} onCheckedChange={setVatEnabled} />
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatAED(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">VAT ({vatEnabled ? '5%' : '0%'})</span>
              <span>{formatAED(totals.vatAmount)}</span>
            </div>
            <div className="flex justify-between border-t pt-1 text-base font-semibold">
              <span>Total</span>
              <span>{formatAED(totals.total)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="invnotes">Notes</Label>
            <Textarea
              id="invnotes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment terms, bank details, thank-you note…"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={loading}>
          {loading ? 'Saving…' : isEdit ? 'Save invoice' : 'Create invoice'}
        </Button>
      </div>
    </div>
  );
}
