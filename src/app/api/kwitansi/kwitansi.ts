// File: src/pages/api/kwitansi.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import PDFDocument from 'pdfkit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    kode_unit,
    nama_sekolah,
    nama_pengirim,
    whatsapp,
    kategori,
    total,
    rincian
  } = req.body;

  if (!kode_unit || !nama_sekolah || !nama_pengirim || !total || !Array.isArray(rincian)) {
    return res.status(400).json({ error: 'Data tidak lengkap' });
  }

  try {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Kwitansi_${kode_unit}.pdf"`);

    const doc = new PDFDocument();
    doc.pipe(res);

    // Header
    doc.fontSize(20).fillColor('#b91c1c').text('Kwitansi Pembayaran', { align: 'center' });
    doc.moveDown();

    // Info Sekolah
    doc.fontSize(12).fillColor('#000000');
    doc.text(`Kode Unit: ${kode_unit}`);
    doc.text(`Nama Sekolah: ${nama_sekolah}`);
    doc.text(`Nama Pengirim: ${nama_pengirim}`);
    doc.text(`WhatsApp: ${whatsapp}`);
    doc.text(`Kategori: ${kategori}`);
    doc.moveDown();

    // Rincian
    doc.fontSize(14).fillColor('#000000').text('Rincian Biaya:', { underline: true });
    doc.moveDown(0.5);
    rincian.forEach((item: any) => {
      doc.text(`- ${item.nama} x ${item.jumlah} tim = Rp ${(item.jumlah * item.biaya).toLocaleString('id-ID')}`);
    });
    doc.moveDown();

    // Total
    doc.fontSize(12).fillColor('#c2410c').text(`Total: Rp ${Number(total).toLocaleString('id-ID')}`, {
      align: 'right',
    });

    doc.moveDown(2);
    doc.fontSize(10).fillColor('#6b7280').text('Dokumen ini dicetak otomatis oleh sistem dan tidak memerlukan tanda tangan.', {
      align: 'center',
      italic: true
    });

    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Gagal membuat PDF' });
  }
}
