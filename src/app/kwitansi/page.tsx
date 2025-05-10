'use client';

import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
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

// ...kode lainnya tetap...

const [progress, setProgress] = useState<number>(0); // NEW

const handleDownload = async () => {
  if (!data) return;
  
  const { nomor, namaPengirim, dataPendaftaran } = data;
  const doc = new jsPDF('p', 'mm', 'a4');
  const margin = 20;
  let y = margin;

  try {
    const [logoBase64, stempelBase64] = await Promise.all([ 
      getImageBase64('/desain-p3k.png'),
      getImageBase64('/Picture1.png')
    ]);

    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLogoHeight = 40;

    const logoImg = new Image();
    logoImg.src = logoBase64;

    logoImg.onload = async () => {
      const ratio = logoImg.width / logoImg.height;
      let logoWidth = pageWidth - margin * 2;
      let logoHeight = logoWidth / ratio;

      if (logoHeight > maxLogoHeight) {
        logoHeight = maxLogoHeight;
        logoWidth = logoHeight * ratio;
      }

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
      doc.setFillColor(209, 250, 229);
      doc.setDrawColor(16, 185, 129);
      doc.setTextColor(6, 95, 70);
      doc.rect(margin, y, 170, 14, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(`Total Pembayaran: Rp ${dataPendaftaran.totalBayar.toLocaleString('id-ID')}`, margin + 5, y + 9);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      const fontSize = 12;
      const stempelWidth = 60;
      const stempelHeight = 60;
      const xRight = pageWidth - margin - 60;

      // Tambahkan jarak vertikal secukupnya sebelum elemen tanda tangan
      y += 20;

      // Teks “Hormat Kami”
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', 'normal');
      doc.text('Hormat Kami,', xRight, y);

      // Stempel (letakkan sedikit lebih tinggi agar tampak rapi dengan teks atas dan bawah)
      const stempelY = y - 13;
      doc.addImage(stempelBase64, 'PNG', xRight - 20, stempelY, stempelWidth, stempelHeight);

      // Teks “Panitia P3K 2025” hanya sedikit di bawah stempel
      const panitiaY = stempelY + stempelHeight - 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Panitia P3K 2025', xRight, panitiaY);


      const blob = doc.output('blob');
      const filename = `kwitansi/${nomor}.pdf`;

      // Upload kwitansi ke Supabase Storage
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('kwitansi')
        .createSignedUploadUrl(filename);

      if (signedUrlError || !signedUrlData?.signedUrl) {
        console.error('❌ Gagal mendapatkan signed URL:', signedUrlError);
        alert('Gagal upload kwitansi. Hubungi panitia.');
        return;
      }

      const xhr = new XMLHttpRequest();
      xhr.open('PUT', signedUrlData.signedUrl, true);
      xhr.setRequestHeader('Content-Type', 'application/pdf');

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = (e.loaded / e.total) * 100;
          setProgress(Math.round(percent));
        }
      };

xhr.onload = async () => {
  if (xhr.status === 200 || xhr.status === 204) {
    setProgress(100);
    setTimeout(async () => {
      console.log("Upload sukses, mendapatkan URL...");
      // Dapatkan URL setelah upload selesai
      const { data: urlData, } = await supabase.storage
        .from('kwitansi')
        .getPublicUrl(filename);

      if ( !urlData?.publicUrl) {
        console.error("❌ Gagal mendapatkan public URL:",);
        alert("Gagal mendapatkan URL kwitansi.");
        return;
      }

      const publicUrl = urlData.publicUrl;

      console.log("Public URL:", publicUrl);

      // Update URL kwitansi di tabel pendaftaran
        const { data, error } = await supabase
          .from('pendaftaran')
          .update({ kwitansi_url: publicUrl })
          .eq('nomor', nomor)
          .select();

        if (error) {
          console.error('Update error:', error);
        } else {
          console.log('Data terupdate:', data);
        }
        
      doc.save(`kwitansi-${nomor}.pdf`);
      setIsDownloaded(true);
      setProgress(0);
    }, 600);
  } else {
    alert('Gagal upload kwitansi ke Supabase.');
  }
};


      xhr.onerror = () => {
        alert('Upload gagal. Periksa koneksi internet.');
      };

      xhr.send(blob);
    };
  } catch (error) {
    console.error('❌ Gagal membuat kwitansi:', error);
    alert('Terjadi kesalahan saat membuat kwitansi.');
  }
};



  

  if (!data) return <p style={{ padding: 24 }}>Memuat kwitansi...</p>;

  return (
    <div style={{ minHeight: '100vh', paddingTop: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, background: 'linear-gradient(135deg, #fbd786, #f7797d)', fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif` }}>
      <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '16px', maxWidth: 680, textAlign: 'center', boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)' }}>
        <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>🎉 Kwitansi Siap Diunduh</p>
        <p style={{ fontSize: 15, color: '#444' }}>Silakan klik tombol di bawah untuk menyimpan kwitansi sebagai bukti pembayaran.</p>
        <p style={{ fontSize: 15, color: '#444', fontWeight: 'bold' }}>Tunjukkan Kwitansi ke Panitia saat Daftar Ulang </p>
        {isDownloaded && (
          <p style={{ marginTop: 16, fontSize: 14, color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, animation: 'fadeIn 0.5s ease-in-out' }}>
            ✅ Kwitansi berhasil diunduh!
          </p>
        )}
      </div>
      <button onClick={handleDownload} style={{ background: 'linear-gradient(to right, #16a34a, #10b981)', color: '#fff', padding: '14px 28px', fontSize: 16, fontWeight: 600, border: 'none', borderRadius: 12, cursor: 'pointer', boxShadow: '0 4px 15px rgba(22, 163, 74, 0.4)', transition: 'all 0.3s ease-in-out' }}>
        📄 Download Kwitansi
      </button>
      <div style={{
        marginTop: 16,
        width: '80%',
        maxWidth: 400,
        height: 20,
        background: '#e5e7eb',
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(270deg, #10b981, #16a34a, #10b981)',
            backgroundSize: '400% 400%',
            animation: 'gradientShift 2s ease infinite',
            transition: 'width 0.3s ease-in-out',
          }}
        />
        <div style={{
          position: 'absolute',
          width: '100%',
          textAlign: 'center',
          top: 0,
          lineHeight: '20px',
          fontWeight: 600,
          fontSize: 13,
        }}>
          {progress < 100 ? `⏳ Mengunggah ${progress}%` : '🚀 Selesai!'}
        </div>
        <style>
          {`
            @keyframes gradientShift {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          `}
        </style>
      </div>
    </div>
  );
}
