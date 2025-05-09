import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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

    const logoWidth = 55;
    const logoHeight = 30;
    doc.addImage(logoBase64, 'PNG', (pageWidth - logoWidth) / 2, y, logoWidth, logoHeight);
    y += logoHeight + 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('KWITANSI PEMBAYARAN', pageWidth / 2, y, { align: 'center' });
    y += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('P3K 2025', pageWidth / 2, y, { align: 'center' });
    y += 12;

    const addRow = (label: string, value: string) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}`, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`: ${value}`, margin + 40, y);
      y += 7;
    };

    addRow('Nomor Kwitansi', nomor);
    addRow('Nama Sekolah', pendaftaran.nama_sekolah);
    addRow('Pembina', pendaftaran.pembina);
    addRow('WhatsApp', pendaftaran.whatsapp);
    addRow('Kategori', pendaftaran.kategori);
    addRow('Nama Pengirim', pendaftaran.nama_pengirim);
    y += 4;

    doc.setFont('helvetica', 'bold');
    doc.text('Lomba yang Diikuti:', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    const lombaFields = [
      ['Tandu Putra', pendaftaran.tandu_putra],
      ['Tandu Putri', pendaftaran.tandu_putri],
      ['Pertolongan Pertama', pendaftaran.pertolongan_pertama],
      ['Senam Poco-poco', pendaftaran.senam_poco_poco],
      ['Mojang Jajaka', pendaftaran.mojang_jajaka],
      ['Poster', pendaftaran.poster],
      ['PMR Cerdas', pendaftaran.pmr_cerdas],
    ];

    lombaFields.forEach(([nama, jumlah]) => {
      if (jumlah && jumlah > 0) {
        doc.text(`- ${nama} (${jumlah} tim)`, margin + 5, y);
        y += 6;
      }
    });

    y += 5;
    doc.setFillColor(209, 250, 229);
    doc.setDrawColor(16, 185, 129);
    doc.setTextColor(6, 95, 70);
    doc.rect(margin, y, 170, 14, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`Total Pembayaran: Rp ${Number(pendaftaran.total).toLocaleString('id-ID')}`, margin + 5, y + 9);
    doc.setTextColor(0, 0, 0);

    const fontSize = 12;
    const stempelWidth = 60;
    const stempelHeight = 60;
    const xRight = pageWidth - margin - 60;
    
    // Posisi awal teks
    y += 20;
    doc.setFontSize(fontSize);
    doc.text('Hormat Kami,', xRight, y);
    
    // Geser sedikit ke bawah dari teks (sekitar 3pt)
    const stempelY = y - 13;
    doc.addImage(`data:image/png;base64,${stempelBase64}`, 'PNG', xRight, stempelY, stempelWidth, stempelHeight);
    
    // Setelah stempel, langsung taruh teks “Panitia…” hanya 5pt di bawahnya
    const panitiaY = stempelY + stempelHeight - 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Panitia P3K 2025.', xRight, panitiaY);
    

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

    const { data: urlData } = supabase.storage.from('kwitansi').getPublicUrl(filename);
    const publicUrl = urlData.publicUrl;

    await supabase.from('pendaftaran').update({ kwitansi_url: publicUrl }).eq('nomor', nomor);

    return NextResponse.json({ success: true, kwitansi_url: publicUrl });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal membuat kwitansi' }, { status: 500 });
  }
}
