'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Pencil, Send, CreditCard, CheckCircle2, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { InvoiceDownloadButton } from './invoice-download-button';
import {
  sendInvoiceAction,
  setInvoiceStatusAction,
  deleteInvoiceAction,
  createPaymentLinkAction,
} from '@/app/(app)/billing/actions';
import type { InvoicePdfData } from '@/lib/pdf/invoice-pdf';

export function InvoiceActions({
  invoiceId,
  status,
  pdfData,
  paymentLink,
}: {
  invoiceId: string;
  status: string;
  pdfData: InvoicePdfData;
  paymentLink: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function send() {
    start(async () => {
      const res = await sendInvoiceAction(invoiceId);
      if (res.ok) {
        toast.success('Invoice sent');
        router.refresh();
      } else toast.error(res.error);
    });
  }
  function markPaid() {
    start(async () => {
      const res = await setInvoiceStatusAction(invoiceId, 'paid');
      if (res.ok) {
        toast.success('Marked as paid');
        router.refresh();
      } else toast.error(res.error);
    });
  }
  function makeLink() {
    start(async () => {
      const res = await createPaymentLinkAction(invoiceId);
      if (res.ok && res.data) {
        window.open(res.data.url, '_blank');
        router.refresh();
      } else if (!res.ok) toast.error(res.error);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <InvoiceDownloadButton data={pdfData} />
      <Button variant="outline" size="sm" asChild>
        <Link href={`/billing/${invoiceId}/edit`}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Link>
      </Button>
      {status !== 'paid' && (
        <Button variant="outline" size="sm" onClick={send} disabled={pending}>
          <Send className="mr-2 h-4 w-4" />
          Send
        </Button>
      )}
      {paymentLink ? (
        <Button variant="outline" size="sm" asChild>
          <a href={paymentLink} target="_blank" rel="noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Payment link
          </a>
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={makeLink} disabled={pending}>
          <CreditCard className="mr-2 h-4 w-4" />
          Payment link
        </Button>
      )}
      {status !== 'paid' && (
        <Button size="sm" onClick={markPaid} disabled={pending}>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Mark paid
        </Button>
      )}
      <ConfirmDialog
        destructive
        title="Delete this invoice?"
        description="This permanently removes the invoice."
        confirmLabel="Delete"
        onConfirm={async () => {
          const res = await deleteInvoiceAction(invoiceId);
          if (res.ok) {
            toast.success('Invoice deleted');
            router.push('/billing');
            router.refresh();
          } else toast.error(res.error);
        }}
        trigger={
          <Button variant="outline" size="sm" aria-label="Delete invoice">
            <Trash2 className="h-4 w-4" />
          </Button>
        }
      />
    </div>
  );
}
