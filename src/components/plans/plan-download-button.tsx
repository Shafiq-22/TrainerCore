'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PlanPdfData } from '@/lib/pdf/plan-pdf';

export function PlanDownloadButton({ data }: { data: PlanPdfData }) {
  const [busy, setBusy] = useState(false);

  async function download() {
    setBusy(true);
    try {
      const { buildWorkoutPlanPdf } = await import('@/lib/pdf/plan-pdf');
      const doc = buildWorkoutPlanPdf(data);
      doc.save(`${data.planName.replace(/\s+/g, '-') || 'workout-plan'}.pdf`);
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
