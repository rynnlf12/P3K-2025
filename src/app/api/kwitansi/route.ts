import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { join } from 'path';
import { readFileSync } from 'fs';

export async function POST(req: NextRequest) {
  const data = await req.json();

  const doc = new PDFDocument();
  const chunks: Uint8Array[] = [];

  doc.on('data', chunk => chunks.push(chunk));
  doc.on('end', () => {});

  const fontPath = join(process.cwd(), 'public', 'fonts', 'Montserrat-Regular.ttf');
  doc.registerFont('Montserrat', readFileSync(fontPath));
  doc.font('Montserrat');

  doc.fontSize(20).text('Kwitansi Pembayaran', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Nama Sekolah: ${data.nama_sekolah}`);
  doc.text(`Nama Pengirim: ${data.nama_pengirim}`);
  doc.text(`WhatsApp: ${data.whatsapp}`);
  doc.text(`Kategori: ${data.kategori}`);
  doc.text(`Kode Unit: ${data.kode_unit}`);
  doc.moveDown();
  doc.text(`Total: Rp ${Number(data.total).toLocaleString('id-ID')}`);
  doc.moveDown();
  doc.text('Rincian Lomba:');
  data.rincian.forEach((r: any) => {
    doc.text(`- ${r.nama} x ${r.jumlah} tim = Rp ${(r.jumlah * r.biaya).toLocaleString('id-ID')}`);
  });

  doc.end();
  const buffer = Buffer.concat(chunks);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=kwitansi_${data.nama_sekolah}_${data.kode_unit}.pdf`,
    },
  });
}