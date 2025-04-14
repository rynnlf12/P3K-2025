'use client';

import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';

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

export default function KwitansiPage() {
  const [data, setData] = useState<{
    nomor: string;
    namaPengirim: string;
    dataPendaftaran: DataPendaftaran;
  } | null>(null);
  const [isDownloaded, setIsDownloaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('formPendaftaran');
    const namaPengirim = localStorage.getItem('namaPengirim') || 'Tanpa Nama';

    if (stored) {
      try {
        const parsed = JSON.parse(stored);

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
      } catch {
        console.error('Gagal parsing data kwitansi');
      }
    }
  }, []);

  const handleDownload = async () => {
    if (!data) return;
  
    const { nomor, namaPengirim, dataPendaftaran } = data;
  
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 20;
    let y = margin;
  
    try {
      const logoBase64 = await getImageBase64('/desain-p3k.png');
      const pageWidth = doc.internal.pageSize.getWidth();
      const maxLogoWidth = pageWidth - margin * 2; // Batas maksimal lebar logo
      const maxLogoHeight = 40; // Batas maksimal tinggi logo
  
      // Membuat image untuk mendapatkan ukuran aslinya
      const img = new Image();
      img.src = logoBase64;
      img.onload = function() {
        const ratio = img.width / img.height;
        
        // Menyesuaikan lebar dan tinggi gambar agar proporsional
        let logoWidth = maxLogoWidth;
        let logoHeight = logoWidth / ratio;
  
        // Memastikan tinggi logo tidak melebihi batas maksimal
        if (logoHeight > maxLogoHeight) {
          logoHeight = maxLogoHeight;
          logoWidth = logoHeight * ratio;
        }
  
        const logoX = (pageWidth - logoWidth) / 2; // Menempatkan gambar di tengah
  
        // Menambahkan gambar dengan ukuran yang sudah disesuaikan
        doc.addImage(logoBase64, 'PNG', logoX, y, logoWidth, logoHeight);
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
        addRow('Nama Sekolah', dataPendaftaran.sekolah.nama);
        addRow('Pembina', dataPendaftaran.sekolah.pembina);
        addRow('WhatsApp', dataPendaftaran.sekolah.whatsapp);
        addRow('Kategori', dataPendaftaran.sekolah.kategori);
        addRow('Nama Pengirim', namaPengirim);
        y += 4;
  
        doc.setFont('helvetica', 'bold');
        doc.text('Lomba yang Diikuti:', margin, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        Object.entries(dataPendaftaran.lombaDipilih).forEach(([nama, jumlah]) => {
          doc.text(`- ${nama} (${jumlah} tim)`, margin + 5, y);
          y += 6;
        });
  
        y += 5;
  
        const totalPeserta = Object.values(dataPendaftaran.peserta).reduce((acc, val) => acc + val.length, 0);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Jumlah Peserta: ${totalPeserta}`, margin, y);
        y += 10;
  
        doc.setFillColor(209, 250, 229);
        doc.setDrawColor(16, 185, 129);
        doc.setTextColor(6, 95, 70);
        doc.rect(margin, y, 170, 14, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(`Total Pembayaran: Rp ${dataPendaftaran.totalBayar.toLocaleString('id-ID')}`, margin + 5, y + 9);
  
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        y += 26;
  
        doc.text('Hormat Kami,', 150, y);
        y += 10;
        doc.text('(Panitia P3K 2025)', 145, y);
  
        doc.save(`kwitansi-${nomor}.pdf`);
        setIsDownloaded(true);
      };
    } catch (error) {
      console.error('Gagal membuat kwitansi:', error);
    }
  };
  
  if (!data) return <p style={{ padding: 24 }}>Memuat kwitansi...</p>;

  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 32,
      background: 'linear-gradient(135deg, #fbd786, #f7797d)', // soft peach to coral
      fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
    }}>
    
      <div style={{
        backgroundColor: '#ffffff',
        padding: '32px',
        borderRadius: '16px',
        maxWidth: 680,
        textAlign: 'center',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease-in-out',
      }}>
        <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>
          🎉 Kwitansi Siap Diunduh
        </p>
        <p style={{ fontSize: 15, color: '#444' }}>
          Silakan klik tombol di bawah untuk menyimpan kwitansi sebagai bukti pembayaran.
        </p>
        {isDownloaded && (
          <p style={{
            marginTop: 16,
            fontSize: 14,
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            animation: 'fadeIn 0.5s ease-in-out',
          }}>
            ✅ Kwitansi berhasil diunduh!
          </p>
        )}
      </div>

      <button
        onClick={handleDownload}
        style={{
          background: 'linear-gradient(to right, #16a34a, #10b981)',
          color: '#fff',
          padding: '14px 28px',
          fontSize: 16,
          fontWeight: 600,
          border: 'none',
          borderRadius: 12,
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(22, 163, 74, 0.4)',
          transition: 'all 0.3s ease-in-out',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 18px rgba(16, 185, 129, 0.6)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(22, 163, 74, 0.4)';
        }}
      >
        📄 Download Kwitansi
      </button>
    </div>
  );
}
