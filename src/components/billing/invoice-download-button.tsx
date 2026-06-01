'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { InvoicePdfData } from '@/lib/pdf/invoice-pdf';

export function InvoiceDownloadButton({ data }: { data: InvoicePdfData }) {
  const [busy, setBusy] = useState(false);

  async function download() {
    setBusy(true);
    try {
      const { buildInvoicePdf } = await import('@/lib/pdf/invoice-pdf');
      const doc = buildInvoicePdf(data);
      doc.save(`${data.invoiceNumber || 'invoice'}.pdf`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={download} disabled={busy}>
      <Download className="mr-2 h-4 w-4" />
      {busy ? 'Generating…' : 'PDF'}
    </Button>
  );
}
