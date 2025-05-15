import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { LOMBA_LIST } from '@/data/lomba';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nomor = searchParams.get('nomor');

  if (!nomor) {
    return NextResponse.json({ error: 'Nomor is required' }, { status: 400 });
  }

  try {
    const { data: pendaftaran, error } = await supabase
      .from('pendaftaran')
      .select('*')
      .eq('nomor', nomor)
      .single();

    if (error || !pendaftaran) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
    }

    // Load images
    const logoPath = path.join(process.cwd(), 'public', 'desain-p3k.png');
    const stempelPath = path.join(process.cwd(), 'public', 'Picture1.png');
    const logoBase64 = fs.readFileSync(logoPath).toString('base64');
    const stempelBase64 = fs.readFileSync(stempelPath).toString('base64');

    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 20;
    let y = margin;
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header Section
    const logoWidth = 40;
    doc.addImage(logoBase64, 'PNG', margin, y, logoWidth, 25);
    
    // Organization Info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('PEKAN PERLOMBAAN PMR (P3K) 2025', margin + logoWidth + 10, y + 8);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('KSR PMI Unit Universitas Suryakancana', margin + logoWidth + 10, y + 14);
    doc.text('Jl. Pasir Gede Raya, Cianjur, Jawa Barat', margin + logoWidth + 10, y + 20);
    
    // Divider
    y += 30;
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('BUKTI PEMBAYARAN RESMI', pageWidth / 2, y, { align: 'center' });
    y += 10;

    // Transaction Info
    const infoColumns = [
      {
        title: 'Informasi Pembayaran',
        content: [
          `Nomor Kwitansi: ${nomor}`,
          `Tanggal: ${new Date().toLocaleDateString('id-ID')}`,
          `Metode Pembayaran: Transfer Bank BCA`
        ]
      },
      {
        title: 'Informasi Sekolah',
        content: [
          `Nama Sekolah: ${pendaftaran.nama_sekolah}`,
          `Pembina: ${pendaftaran.pembina}`,
          `WhatsApp: ${pendaftaran.whatsapp}`
        ]
      }
    ];

    // Render columns
    const columnWidth = (pageWidth - margin * 2 - 10) / 2;
    infoColumns.forEach((col, idx) => {
      const x = margin + (columnWidth + 10) * idx;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(col.title, x, y);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      col.content.forEach((text, i) => {
        doc.text(text, x, y + 8 + (i * 5));
      });
    });
    y += 35;

    // Competition Details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Detail Perlombaan:', margin, y);
    y += 7;

    // Table
    const headers = ['Nama Lomba', 'Jumlah Tim', 'Biaya'];
    const rows = LOMBA_LIST
      .filter(lomba => pendaftaran[lomba.id.replace(/-/g, '_')] > 0)
      .map(lomba => [
        lomba.nama,
        pendaftaran[lomba.id.replace(/-/g, '_')].toString(),
        `Rp ${(lomba.biaya * pendaftaran[lomba.id.replace(/-/g, '_')]).toLocaleString('id-ID')}`
      ]);

    const colWidths = [90, 30, 50];
    const rowHeight = 8;
    
    // Table Header
    doc.setFillColor(23, 37, 84);
    doc.setTextColor(255, 255, 255);
    let x = margin;
    headers.forEach((header, i) => {
      doc.rect(x, y, colWidths[i], rowHeight, 'F');
      doc.text(header, x + 3, y + 5);
      x += colWidths[i];
    });
    y += rowHeight;

    // Table Rows
    doc.setTextColor(0, 0, 0);
    rows.forEach(row => {
      x = margin;
      row.forEach((cell, i) => {
        doc.setFont('helvetica', i === 2 ? 'bold' : 'normal');
        doc.text(cell, x + 3, y + 5);
        doc.rect(x, y, colWidths[i], rowHeight);
        x += colWidths[i];
      });
      y += rowHeight;
    });
    y += 10;

    // Total Payment
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`Total Pembayaran: Rp ${pendaftaran.total.toLocaleString('id-ID')}`, 
      pageWidth - margin - 80, y, { align: 'right' });
    y += 15;

    // Stamp Section
    const stampWidth = 65;
    const stampHeight = 65;
    const stampX = pageWidth - margin - stampWidth;
    const startY = y;
    const dateText = 'Cianjur, ' + new Date().toLocaleDateString('id-ID');

    // Date text
    doc.setFontSize(12);
    const dateX = stampX + (stampWidth/2) - (doc.getTextWidth(dateText)/2);
    doc.text(dateText, dateX, startY);

    // Stamp image
    const stampY = startY - 15;
    doc.addImage(stempelBase64, 'PNG', stampX, stampY, stampWidth, stampHeight);

    // Panitia text
    const panitiaText = 'Panitia P3K 2025';
    doc.setFontSize(12);
    const panitiaX = stampX + (stampWidth/2) - (doc.getTextWidth(panitiaText)/2);
    const panitiaY = stampY + stampHeight - 9;
    doc.setFont('helvetica', 'bold');
    doc.text(panitiaText, panitiaX, panitiaY);

    // Footer
    y = doc.internal.pageSize.getHeight() - margin;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text('Kwitansi ini merupakan bukti pembayaran yang sah, tunjukkan kwitansi ini saat daftar ulang', 
      pageWidth / 2, y, { align: 'center' });
    doc.text('Contact: ksrunitunsur@gmail.com | Telp: (+628) 5603-1052-34', 
      pageWidth / 2, y + 5, { align: 'center' });

    // Save to Supabase Storage
    const pdfBuffer = doc.output('arraybuffer');
    const filename = `kwitansi/${nomor}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from('kwitansi')
      .upload(filename, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data: urlData } = supabase.storage
      .from('kwitansi')
      .getPublicUrl(filename);

    // Update database with kwitansi URL
    await supabase.from('pendaftaran')
      .update({ kwitansi_url: urlData.publicUrl })
      .eq('nomor', nomor);

    return NextResponse.json({ 
      success: true, 
      kwitansi_url: urlData.publicUrl 
    });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ 
      error: 'Gagal membuat kwitansi',
      details: err.message 
    }, { status: 500 });
  }
}