import { jsPDF } from 'jspdf';
import { getEmotionLabel } from '../config/emotions';

/**
 * Export endast ackumulerad klassstatistik till PDF.
 * Ingen individdata – endast aggregerade siffror och sammanfattning.
 */
export function exportStatsPdf(options: {
  summaryText: string;
  topEmotion: string;
  total: number;
  buckets: Record<string, number>;
  timeSeries: Array<{ date: string; buckets?: Record<string, unknown> }>;
  periodFrom: Date;
  periodTo: Date;
  className?: string;
}): void {
  const {
    summaryText,
    topEmotion,
    total,
    buckets,
    timeSeries,
    periodFrom,
    periodTo,
    className = 'Klassen',
  } = options;

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.getPageWidth();
  let y = 20;

  const addTitle = (text: string, fontSize = 16) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'bold');
    doc.text(text, 20, y);
    y += fontSize / 2 + 4;
  };

  const addText = (text: string, fontSize = 11) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(text, pageW - 40);
    doc.text(lines, 20, y);
    y += lines.length * (fontSize * 0.4) + 4;
  };

  // Titel
  addTitle('Klassens statistik – MindGrow', 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Period: ${periodFrom.toLocaleDateString('sv-SE')} – ${periodTo.toLocaleDateString('sv-SE')}`, 20, y);
  y += 10;

  addTitle('Sammanfattning (ackumulerad data)');
  addText(summaryText || 'Ingen sammanfattning tillgänglig för perioden.');
  if (topEmotion) {
    addText(`Vanligast registrerade känslan: ${getEmotionLabel(topEmotion) || topEmotion}`);
  }
  addText(`Totalt antal registreringar i klassen: ${total}`);
  y += 8;

  // Emotionfördelning (endast aggregerade tal)
  addTitle('Emotionfördelning (antal per känsla)');
  const bucketKeys = Object.keys(buckets || {});
  if (bucketKeys.length > 0) {
    bucketKeys.forEach((key) => {
      const label = getEmotionLabel(key) || key;
      const count = (buckets as Record<string, number>)[key] ?? 0;
      addText(`${label}: ${count}`);
    });
  } else {
    addText('Ingen fördelning tillgänglig för perioden.');
  }
  y += 8;

  // Veckotrend (totalt per dag – ingen individdata)
  addTitle('Aktivitet per dag (totalt)');
  if (timeSeries && timeSeries.length > 0) {
    timeSeries.forEach((ts) => {
      const dayTotal = ts.buckets
        ? Object.values(ts.buckets).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0)
        : 0;
      const dateStr = new Date(ts.date).toLocaleDateString('sv-SE', { weekday: 'short', day: 'numeric', month: 'short' });
      addText(`${dateStr}: ${dayTotal} registreringar`);
    });
  } else {
    addText('Ingen tidsdata för perioden.');
  }

  y += 12;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(
    'Denna rapport innehåller endast ackumulerad klassstatistik. Ingen elev identifieras.',
    20,
    y
  );
  y += 8;
  doc.text(`Genererad ${new Date().toLocaleString('sv-SE')} för ${className}.`, 20, y);

  doc.save(`MindGrow-klassstatistik-${periodFrom.toISOString().slice(0, 10)}.pdf`);
}
