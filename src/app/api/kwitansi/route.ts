import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import blobStream from 'blob-stream';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Create PDF document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = doc.pipe(blobStream());

    // Styling
    const primaryColor = '#dc2626'; // Red-600
    const secondaryColor = '#ea580c'; // Orange-600
    
    // Header
    doc
      .fontSize(18)
      .text('KWITANSI P3K 2025', { align: 'center', underline: true })
      .moveDown(1);

    // Informasi Utama
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text('Kode Unit:', { continued: true })
      .fillColor('black')
      .text(` ${body.kode_unit}`)
      .fillColor(primaryColor)
      .text('Nama Sekolah:', { continued: true })
      .fillColor('black')
      .text(` ${body.nama_sekolah}`)
      .fillColor(primaryColor)
      .text('Tanggal:', { continued: true })
      .fillColor('black')
      .text(` ${new Date().toLocaleDateString('id-ID')}`)
      .moveDown(1);

    // Tabel Rincian
    doc
      .fontSize(14)
      .fillColor(secondaryColor)
      .text('Rincian Pembayaran:', { underline: true })
      .moveDown(0.5);

    // Header Tabel
    doc
      .fontSize(10)
      .fillColor('white')
      .rect(50, doc.y, 500, 20)
      .fill(primaryColor)
      .text('No', 50, doc.y + 5, { width: 30, align: 'center' })
      .text('Nama Lomba', 80, doc.y + 5)
      .text('Jumlah Tim', 350, doc.y + 5, { width: 60, align: 'center' })
      .text('Biaya per Tim', 410, doc.y + 5, { width: 80, align: 'right' })
      .text('Total', 490, doc.y + 5, { width: 60, align: 'right' })
      .moveDown(1);

    // Isi Tabel
    let yPosition = doc.y;
    body.rincian.forEach((item: any, index: number) => {
      doc
        .fontSize(10)
        .fillColor('black')
        .text(`${index + 1}.`, 50, yPosition + 5, { width: 30, align: 'center' })
        .text(item.nama, 80, yPosition + 5, { width: 270 })
        .text(item.jumlah.toString(), 350, yPosition + 5, { width: 60, align: 'center' })
        .text(`Rp ${item.biaya.toLocaleString('id-ID')}`, 410, yPosition + 5, { width: 80, align: 'right' })
        .text(`Rp ${(item.jumlah * item.biaya).toLocaleString('id-ID')}`, 490, yPosition + 5, { width: 60, align: 'right' });
      
      yPosition += 20;
    });

    // Total
    doc
      .moveTo(50, yPosition + 10)
      .lineTo(550, yPosition + 10)
      .stroke()
      .fontSize(12)
      .fillColor(primaryColor)
      .text('TOTAL PEMBAYARAN:', 350, yPosition + 20, { width: 140, align: 'right' })
      .fillColor('black')
      .text(`Rp ${parseInt(body.total).toLocaleString('id-ID')}`, 490, yPosition + 20, { width: 60, align: 'right' })
      .moveDown(2);

    // Footer
    doc
      .fontSize(10)
      .fillColor('#6b7280') // Gray-500
      .text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 50, doc.page.height - 100)
      .text('Panitia P3K 2025', 50, doc.page.height - 80, { align: 'left' })
      .text('Terima kasih telah mendaftar', 50, doc.page.height - 60, { align: 'left' });

    // Finalize PDF
    doc.end();
    
    // Convert to blob
    const blob = await new Promise<any>((resolve) => {
      stream.on('finish', () => {
        resolve(stream.toBlob('application/pdf'));
      });
    });

    return new Response(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=Kwitansi_${body.nama_sekolah}.pdf`,
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Gagal membuat PDF' },
      { status: 500 }
    );
  }
}