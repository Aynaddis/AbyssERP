import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { AppError } from '../middleware/errorHandler';
import { getSaleById } from './sale.service';

const ACCENT = rgb(0.94, 0.65, 0);
const DANGER = rgb(0.86, 0.2, 0.2);
const SUCCESS = rgb(0.13, 0.55, 0.25);

const WATERMARKS: Record<string, { text: string; color: ReturnType<typeof rgb> }> = {
  COMPLETED: { text: 'PAID', color: SUCCESS },
  CANCELLED: { text: 'CANCELLED', color: DANGER },
};

export async function generateInvoicePdf(saleId: string): Promise<Uint8Array> {
  const sale = await getSaleById(saleId);
  if (!sale) {
    throw new AppError('Sale not found', 404);
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  let y = height - 60;

  page.drawText('AbyssERP', { x: 50, y, size: 22, font: fontBold, color: ACCENT });
  page.drawText('INVOICE', { x: width - 150, y, size: 22, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
  y -= 35;

  page.drawText(`Invoice #: ${sale.id.slice(-8).toUpperCase()}`, { x: width - 200, y, size: 10, font });
  y -= 14;
  page.drawText(`Date: ${new Date(sale.createdAt).toLocaleDateString()}`, {
    x: width - 200,
    y,
    size: 10,
    font,
  });
  y -= 14;
  const statusStyle = WATERMARKS[sale.status];
  page.drawText(`Status: ${sale.status}`, {
    x: width - 200,
    y,
    size: 10,
    font: fontBold,
    color: statusStyle?.color ?? rgb(0, 0, 0),
  });

  y = height - 130;
  page.drawText('Bill To:', { x: 50, y, size: 11, font: fontBold });
  y -= 16;
  page.drawText(sale.customer?.name ?? 'Walk-in Customer', { x: 50, y, size: 10, font });
  if (sale.customer?.email) {
    y -= 14;
    page.drawText(sale.customer.email, { x: 50, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
  }

  y -= 40;
  page.drawRectangle({ x: 50, y: y - 8, width: width - 100, height: 24, color: rgb(0.95, 0.95, 0.95) });
  page.drawText('Product', { x: 58, y, size: 10, font: fontBold });
  page.drawText('Qty', { x: 320, y, size: 10, font: fontBold });
  page.drawText('Unit Price', { x: 390, y, size: 10, font: fontBold });
  page.drawText('Subtotal', { x: 480, y, size: 10, font: fontBold });

  y -= 30;

  for (const item of sale.items) {
    page.drawText(item.product.name, { x: 58, y, size: 10, font });
    page.drawText(String(item.quantity), { x: 320, y, size: 10, font });
    page.drawText(`$${item.unitPrice.toFixed(2)}`, { x: 390, y, size: 10, font });
    page.drawText(`$${item.subtotal.toFixed(2)}`, { x: 480, y, size: 10, font });
    y -= 22;
  }

  y -= 10;
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  });
  y -= 26;

  page.drawText('Total', { x: 390, y, size: 12, font: fontBold });
  page.drawText(`$${sale.totalAmount.toFixed(2)}`, { x: 480, y, size: 12, font: fontBold, color: ACCENT });

  page.drawText('Thank you for your business.', {
    x: 50,
    y: 60,
    size: 9,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  const watermark = WATERMARKS[sale.status];
  if (watermark) {
    const watermarkFont = fontBold;
    const watermarkSize = 90;
    const textWidth = watermarkFont.widthOfTextAtSize(watermark.text, watermarkSize);

    page.drawText(watermark.text, {
      x: width / 2 - textWidth / 2,
      y: height / 2,
      size: watermarkSize,
      font: watermarkFont,
      color: watermark.color,
      opacity: 0.15,
      rotate: degrees(35),
    });
  }

  return pdfDoc.save();
}