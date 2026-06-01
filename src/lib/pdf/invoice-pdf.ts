import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Shape of the data required to render a UAE Tax Invoice. All amounts are in AED
 * and all dates are expected to be pre-formatted by the caller (e.g. "01 Jun 2026").
 */
export interface InvoicePdfData {
  invoiceNumber: string;
  issueDate: string; // already formatted e.g. "01 Jun 2026"
  dueDate: string | null; // already formatted or null
  business: { name: string; vatNumber: string | null; address: string | null };
  client: { name: string; email: string | null; phone: string | null };
  lineItems: { description: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  currency: string; // "AED"
  notes: string | null;
}

/** Brand palette (kept literal so the PDF never depends on CSS variables). */
const PRIMARY: [number, number, number] = [15, 23, 42]; // #0F172A
const ACCENT: [number, number, number] = [34, 197, 94]; // #22C55E
const MUTED: [number, number, number] = [100, 116, 139]; // slate-500
const BORDER: [number, number, number] = [226, 232, 240]; // slate-200

/**
 * Format a number with two decimals and thousands separators. No currency prefix —
 * the column/label already states the currency (AED).
 */
function money(n: number): string {
  const value = Number.isFinite(n) ? n : 0;
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Read the Y coordinate at which the most recent autoTable finished drawing. */
function lastTableFinalY(doc: jsPDF, fallback: number): number {
  const finalY = (doc as unknown as { lastAutoTable?: { finalY?: number } })
    .lastAutoTable?.finalY;
  return typeof finalY === 'number' ? finalY : fallback;
}

/**
 * Build a clean, professional UAE Tax Invoice as a jsPDF document (A4 portrait).
 * The caller is responsible for output, e.g. `buildInvoicePdf(data).output('arraybuffer')`.
 */
export function buildInvoicePdf(data: InvoicePdfData): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 48;
  const contentRight = pageWidth - marginX;

  // --- Header: title + business identity ------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text('TAX INVOICE', marginX, 64);

  // Business block (left, beneath the title).
  let businessY = 92;
  doc.setFontSize(12);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text(data.business.name, marginX, businessY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);

  if (data.business.address) {
    const addressLines = doc.splitTextToSize(data.business.address, 230);
    businessY += 14;
    doc.text(addressLines, marginX, businessY);
    businessY += (addressLines.length - 1) * 12;
  }
  if (data.business.vatNumber) {
    businessY += 14;
    doc.text(`VAT Reg. No: ${data.business.vatNumber}`, marginX, businessY);
  }

  // Invoice meta block (right aligned).
  const metaRows: { label: string; value: string }[] = [
    { label: 'Invoice No.', value: data.invoiceNumber },
    { label: 'Issue Date', value: data.issueDate },
  ];
  if (data.dueDate) metaRows.push({ label: 'Due Date', value: data.dueDate });

  let metaY = 92;
  for (const row of metaRows) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(row.label, contentRight - 150, metaY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
    doc.text(row.value, contentRight, metaY, { align: 'right' });
    metaY += 16;
  }

  // Divider under the header.
  const headerBottom = Math.max(businessY, metaY) + 18;
  doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
  doc.setLineWidth(1);
  doc.line(marginX, headerBottom, contentRight, headerBottom);

  // --- Bill To --------------------------------------------------------------
  let billY = headerBottom + 26;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  doc.text('BILL TO', marginX, billY);

  billY += 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text(data.client.name, marginX, billY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  if (data.client.email) {
    billY += 14;
    doc.text(data.client.email, marginX, billY);
  }
  if (data.client.phone) {
    billY += 14;
    doc.text(data.client.phone, marginX, billY);
  }

  // --- Line items table -----------------------------------------------------
  const tableStartY = billY + 28;
  autoTable(doc, {
    startY: tableStartY,
    margin: { left: marginX, right: marginX },
    head: [['Description', 'Qty', 'Unit Price (AED)', 'Amount (AED)']],
    body: data.lineItems.map((item) => [
      item.description,
      String(item.quantity),
      money(item.unitPrice),
      money(item.quantity * item.unitPrice),
    ]),
    styles: {
      font: 'helvetica',
      fontSize: 9.5,
      cellPadding: 8,
      textColor: PRIMARY,
      lineColor: BORDER,
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: PRIMARY,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 'auto' },
      1: { halign: 'right', cellWidth: 50 },
      2: { halign: 'right', cellWidth: 100 },
      3: { halign: 'right', cellWidth: 100 },
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  // --- Totals block (right aligned) -----------------------------------------
  let totalsY = lastTableFinalY(doc, tableStartY) + 20;
  const totalsLabelX = contentRight - 200;

  const writeTotalRow = (
    label: string,
    value: string,
    opts?: { bold?: boolean; size?: number }
  ) => {
    const size = opts?.size ?? 10;
    doc.setFont('helvetica', opts?.bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
    doc.text(label, totalsLabelX, totalsY);
    doc.text(value, contentRight, totalsY, { align: 'right' });
  };

  writeTotalRow('Subtotal', money(data.subtotal));
  totalsY += 18;
  writeTotalRow(
    `VAT (${(data.vatRate * 100).toFixed(0)}%)`,
    money(data.vatAmount)
  );

  // Accent underline above the grand total.
  totalsY += 14;
  doc.setDrawColor(ACCENT[0], ACCENT[1], ACCENT[2]);
  doc.setLineWidth(1.5);
  doc.line(totalsLabelX, totalsY, contentRight, totalsY);

  totalsY += 22;
  writeTotalRow(
    `Total (${data.currency})`,
    `${data.currency} ${money(data.total)}`,
    { bold: true, size: 13 }
  );

  // --- Footer: notes + payment terms ----------------------------------------
  let footerY = Math.max(totalsY + 48, pageHeight - 120);
  if (footerY > pageHeight - 80) footerY = pageHeight - 80;

  doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
  doc.setLineWidth(0.5);
  doc.line(marginX, footerY - 16, contentRight, footerY - 16);

  if (data.notes) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text('Notes', marginX, footerY);

    doc.setFont('helvetica', 'normal');
    const noteLines = doc.splitTextToSize(data.notes, pageWidth - marginX * 2);
    doc.text(noteLines, marginX, footerY + 13);
    footerY += 13 + noteLines.length * 11;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  doc.text(
    `Payment terms: ${
      data.dueDate ? `Payment due by ${data.dueDate}.` : 'Payment due upon receipt.'
    }`,
    marginX,
    footerY + 16
  );
  doc.text(
    'This is a computer-generated tax invoice.',
    marginX,
    footerY + 28
  );

  return doc;
}
