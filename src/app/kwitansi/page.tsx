'use client';

import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import { LOMBA_LIST } from '@/data/lomba';
import { supabase } from '@/lib/supabase';

type DataPendaftaran = {
  sekolah: {
    nama: string;
    pembina: string;
    whatsapp: string;
    kategori: string;
  };
  lombaDipilih: Record<string, number>;
  peserta: Record<string, string[][]>;
  totalBayar: number;
};

const getImageBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Canvas not supported');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (err) => reject(err);
  });
};

interface GeneratedPDF {
  doc: jsPDF;
  blob: Blob;
}

const generatePDF = async (data: {
  nomor: string;
  dataPendaftaran: DataPendaftaran;
}): Promise<GeneratedPDF> => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const margin = 20;
  let y = margin;

  try {
    const [logoBase64, stempelBase64] = await Promise.all([
      getImageBase64('/desain-p3k.png'),
      getImageBase64('/Picture1.png')
    ]);

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
        `Nomor Kwitansi: ${data.nomor}`,
        `Tanggal: ${new Date().toLocaleDateString('id-ID')}`,
        `Metode Pembayaran: Transfer Bank BCA`
      ],
      // Tambah style khusus
      styles: {
        title: { fontSize: 12, fontStyle: 'bold' },
        content: { fontSize: 12 }
      }
    },
    {
      title: 'Informasi Sekolah',
      content: [
        `Nama Sekolah: ${data.dataPendaftaran.sekolah.nama}`,
        `Pembina: ${data.dataPendaftaran.sekolah.pembina}`,
        `WhatsApp: ${data.dataPendaftaran.sekolah.whatsapp}`
      ],
      styles: {
        title: { fontSize: 12, fontStyle: 'bold' },
        content: { fontSize: 12 }
      }
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
    const rows = Object.entries(data.dataPendaftaran.lombaDipilih).map(([id, jumlah]) => {
      const lomba = LOMBA_LIST.find(l => l.id === id);
      return [
        lomba?.nama || id,
        jumlah.toString(),
        `Rp ${((lomba?.biaya || 0) * jumlah).toLocaleString('id-ID')}`
      ];
    });

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
    doc.text(`Total Pembayaran: Rp ${data.dataPendaftaran.totalBayar.toLocaleString('id-ID')}`, 
      pageWidth - margin - 80, y, { align: 'right' });
    y += 15;

    // Stamp Section
    const stampWidth = 65;
    const stampHeight = 65;
    const stampX = pageWidth - margin - stampWidth;
    // Hitung posisi vertikal
    const startY = y;
    const dateText = 'Cianjur, ' + new Date().toLocaleDateString('id-ID');

    // 1. Teks tanggal
    doc.setFontSize(12); // Diperkecil sedikit
    const dateX = stampX + (stampWidth/2) - (doc.getTextWidth(dateText)/2);
    doc.text(dateText, dateX, startY);

    // 3. Stempel
    const stampY = startY - 15; // Jarak dari garis diperkecil
    doc.addImage(stempelBase64, 'PNG', stampX, stampY, stampWidth, stampHeight);

    // 4. Teks panitia
    const panitiaText = 'Panitia P3K 2025';
    doc.setFontSize(12); // Diperkecil
    const panitiaX = stampX + (stampWidth/2) - (doc.getTextWidth(panitiaText)/2);
    const panitiaY = stampY + stampHeight - 9; // Jarak dari stempel diperpendek
    doc.setFont('helvetica', 'bold');
    doc.text(panitiaText, panitiaX, panitiaY);

    // Update Y position
    y = panitiaY + 5; // Diperkecil untuk konten berikutnya

    // Footer
    y = doc.internal.pageSize.getHeight() - margin;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text('Kwitansi ini merupakan bukti pembayaran yang sah, tunjukkan kwitansi ini saat daftar ulang', pageWidth / 2, y, { align: 'center' });
    doc.text('Contact: ksrunitunsur@gmail.com | Telp: (+628) 5603-1052-34', pageWidth / 2, y + 5, { align: 'center' });

    const blob = doc.output('blob');
    return { doc, blob };
    
  } catch (error) {
    console.error('Gagal generate PDF:', error);
    throw new Error('Gagal membuat dokumen PDF');
  }
};

export default function KwitansiPage() {
  const [data, setData] = useState<{
    nomor: string;
    namaPengirim: string;
    dataPendaftaran: DataPendaftaran;
  } | null>(null);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = () => {
      try {
        const stored = localStorage.getItem('formPendaftaran');
        const namaPengirim = localStorage.getItem('namaPengirim') || 'Tanpa Nama';

        if (!stored) throw new Error('Data pendaftaran tidak ditemukan');

        const parsed = JSON.parse(stored);
        if (!parsed?.sekolah?.nama) throw new Error('Data tidak valid');

        const now = new Date();
        const offset = 7 * 60 * 60 * 1000;
        const wib = new Date(now.getTime() + offset);
        const pad = (n: number) => String(n).padStart(2, '0');
        const timestamp = `${wib.getFullYear()}${pad(wib.getMonth() + 1)}${pad(wib.getDate())}${pad(wib.getHours())}${pad(wib.getMinutes())}`;
        const nomor = `P3K2025-${parsed.sekolah.nama.replace(/\s+/g, '').toUpperCase().slice(0, 10)}-${timestamp}`;

        setData({
          nomor: nomor,
          namaPengirim,
          dataPendaftaran: parsed,
        });
      } catch (err) {
        console.error('Gagal memuat data:', err);
        setError('Gagal memuat data kwitansi. Silakan hubungi panitia.');
      }
    };

    loadData();
  }, []);

 const handleDownload = async () => {
  if (!data) return;
  
  setError(null);
  
  try {
    // 1. Generate dan simpan PDF lokal terlebih dahulu
    const { doc, blob } = await generatePDF(data);
    doc.save(`kwitansi-${data.nomor}.pdf`);
    
    // 2. Setelah berhasil simpan lokal, lanjutkan upload ke Supabase
    const filename = `kwitansi-${data.nomor}.pdf`;
    
    // 3. Upload ke Supabase di background
    supabase.storage
      .from('kwitansi')
      .upload(filename, blob)
      .then(async ({ error: uploadError }) => {
        if (!uploadError) {
          const { data: urlData } = await supabase.storage
            .from('kwitansi')
            .getPublicUrl(filename);
            
          if (urlData?.publicUrl) {
            await supabase
              .from('pendaftaran')
              .update({ kwitansi_url: urlData.publicUrl })
              .eq('nomor', data.nomor);
          }
        }
      })
      .catch(console.error);

    setIsDownloaded(true);

  } catch (err) {
    console.error('Error:', err);
    setError('Gagal mengunduh kwitansi. Silakan coba lagi.');
  }
};

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 max-w-md">
          <div className="text-2xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold mb-4">Terjadi Kesalahan</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-600">
          Memuat data kwitansi...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-red-50 to-yellow-50">
      <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4 text-yellow-600">
          🎉 Kwitansi Siap Diunduh
        </h1>
        
        <div className="space-y-4 mb-8">
          <p className="text-gray-600">
            Silakan klik tombol di bawah untuk menyimpan kwitansi sebagai bukti pembayaran.
          </p>
          <p className="text-gray-600 font-semibold">
            Tunjukkan kwitansi ini ke panitia saat daftar ulang
          </p>
        </div>

        <button
          onClick={handleDownload}
          className="bg-gradient-to-r from-yellow-600 to-red-600 text-white px-8 py-3 rounded-lg font-medium hover:from-yellow-700 hover:to-red-700 transition-all"
        >
          📥 Download Kwitansi
        </button>

        {isDownloaded && (
          <div className="mt-6 text-green-600 animate-fade-in">
            ✅ Berhasil diunduh!
          </div>
        )}
      </div>
    </div>
  );
}