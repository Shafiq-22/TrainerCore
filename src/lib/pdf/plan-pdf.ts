import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/** A single training day within a week. */
export interface PlanPdfDay {
  label: string;
  dayOfWeek: number;
  isRest: boolean;
  exercises: {
    name: string;
    sets: number | null;
    reps: string | null;
    restSeconds: number | null;
    notes: string | null;
  }[];
}

/** A week of training days. */
export interface PlanPdfWeek {
  weekNumber: number;
  days: PlanPdfDay[];
}

/** Full payload required to render a workout plan PDF. */
export interface PlanPdfData {
  planName: string;
  description: string | null;
  goal: string | null;
  trainerName: string;
  clientName: string | null;
  weeks: PlanPdfWeek[];
}

/** Brand palette (literal so the PDF never depends on CSS variables). */
const PRIMARY: [number, number, number] = [15, 23, 42]; // #0F172A
const ACCENT: [number, number, number] = [34, 197, 94]; // #22C55E
const MUTED: [number, number, number] = [100, 116, 139]; // slate-500
const BORDER: [number, number, number] = [226, 232, 240]; // slate-200

/** Read the Y coordinate at which the most recent autoTable finished drawing. */
function lastTableFinalY(doc: jsPDF, fallback: number): number {
  const finalY = (doc as unknown as { lastAutoTable?: { finalY?: number } })
    .lastAutoTable?.finalY;
  return typeof finalY === 'number' ? finalY : fallback;
}

/** Human-friendly rest interval, e.g. 90 -> "90s", 120 -> "2m". */
function formatRest(seconds: number | null): string {
  if (seconds == null || seconds <= 0) return '—';
  if (seconds % 60 === 0) return `${seconds / 60}m`;
  if (seconds > 60) {
    const mins = Math.floor(seconds / 60);
    const rem = seconds % 60;
    return `${mins}m ${rem}s`;
  }
  return `${seconds}s`;
}

/**
 * Build a clean, professional workout plan as a jsPDF document (A4 portrait).
 * Page breaks are handled automatically by autoTable; a tracked cursor keeps
 * non-table content flowing correctly across pages.
 */
export function buildWorkoutPlanPdf(data: PlanPdfData): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 48;
  const contentWidth = pageWidth - marginX * 2;
  const bottomLimit = pageHeight - 56;

  let cursorY = 64;

  /** Add a new page and reset the cursor to the top margin. */
  const newPage = () => {
    doc.addPage();
    cursorY = 56;
  };

  /** Ensure there is room for `needed` points; otherwise start a new page. */
  const ensureSpace = (needed: number) => {
    if (cursorY + needed > bottomLimit) newPage();
  };

  // --- Title ----------------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  const titleLines = doc.splitTextToSize(data.planName, contentWidth);
  doc.text(titleLines, marginX, cursorY);
  cursorY += titleLines.length * 24;

  // --- Subtitle: trainer / client -------------------------------------------
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  cursorY += 4;
  doc.text(`Prepared by ${data.trainerName}`, marginX, cursorY);
  if (data.clientName) {
    cursorY += 14;
    doc.text(`For ${data.clientName}`, marginX, cursorY);
  }

  // --- Goal -----------------------------------------------------------------
  if (data.goal) {
    cursorY += 18;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(ACCENT[0], ACCENT[1], ACCENT[2]);
    doc.text('Goal: ', marginX, cursorY);
    const goalLabelWidth = doc.getTextWidth('Goal: ');
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
    const goalLines = doc.splitTextToSize(
      data.goal,
      contentWidth - goalLabelWidth
    );
    doc.text(goalLines, marginX + goalLabelWidth, cursorY);
    cursorY += (goalLines.length - 1) * 12;
  }

  // --- Description ----------------------------------------------------------
  if (data.description) {
    cursorY += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    const descLines = doc.splitTextToSize(data.description, contentWidth);
    doc.text(descLines, marginX, cursorY);
    cursorY += descLines.length * 12;
  }

  // Divider below the intro.
  cursorY += 12;
  doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
  doc.setLineWidth(1);
  doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
  cursorY += 8;

  // --- Weeks & days ---------------------------------------------------------
  for (const week of data.weeks) {
    ensureSpace(60);
    cursorY += 22;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
    doc.text(`Week ${week.weekNumber}`, marginX, cursorY);
    cursorY += 6;

    const orderedDays = [...week.days].sort(
      (a, b) => a.dayOfWeek - b.dayOfWeek
    );

    for (const day of orderedDays) {
      if (day.isRest || day.exercises.length === 0) {
        ensureSpace(28);
        cursorY += 22;
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
        doc.text(`${day.label}: Rest day`, marginX, cursorY);
        continue;
      }

      ensureSpace(70);
      cursorY += 22;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
      doc.text(day.label, marginX, cursorY);
      cursorY += 6;

      autoTable(doc, {
        startY: cursorY,
        margin: { left: marginX, right: marginX, bottom: 56 },
        head: [['Exercise', 'Sets', 'Reps', 'Rest', 'Notes']],
        body: day.exercises.map((ex) => [
          ex.name,
          ex.sets != null ? String(ex.sets) : '—',
          ex.reps ?? '—',
          formatRest(ex.restSeconds),
          ex.notes ?? '',
        ]),
        styles: {
          font: 'helvetica',
          fontSize: 9,
          cellPadding: 6,
          textColor: PRIMARY,
          lineColor: BORDER,
          lineWidth: 0.5,
          valign: 'middle',
        },
        headStyles: {
          fillColor: PRIMARY,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 'auto', fontStyle: 'bold' },
          1: { halign: 'center', cellWidth: 42 },
          2: { halign: 'center', cellWidth: 64 },
          3: { halign: 'center', cellWidth: 56 },
          4: { cellWidth: 150 },
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });

      cursorY = lastTableFinalY(doc, cursorY) + 4;
    }
  }

  // --- Footer page numbers --------------------------------------------------
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(
      `${data.planName} · Page ${page} of ${pageCount}`,
      marginX,
      pageHeight - 28
    );
  }

  return doc;
}
