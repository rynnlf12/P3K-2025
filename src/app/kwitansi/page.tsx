'use client';

import { useEffect, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

export default function KwitansiPage() {
  const kwitansiRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<{
    nomor: string;
    namaPengirim: string;
    dataPendaftaran: DataPendaftaran;
  } | null>(null);

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
    if (!kwitansiRef.current) return;
  
    const originalScale = document.body.style.zoom;
    document.body.style.zoom = '1'; // Matikan zoom dulu untuk stabilitas layout
  
    try {
      // Scroll ke atas agar elemen di viewport (beberapa browser seperti Safari perlu ini)
      window.scrollTo(0, 0);
  
      const canvas = await html2canvas(kwitansiRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        windowWidth: 800, // lebar fixed saat render
      });
  
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
  
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        const blob = pdf.output('blob');
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `kwitansi-${data?.nomor || 'download'}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(blobUrl);
        alert('📎 Jika PDF tidak otomatis tersimpan, tekan dan tahan tampilan lalu pilih "Download" atau "Simpan".');
      } else {
        pdf.save(`kwitansi-${data?.nomor || 'download'}.pdf`);
      }
    } catch (err) {
      console.error('Error saat mendownload kwitansi:', err);
    } finally {
      document.body.style.zoom = originalScale || ''; // Balikin zoom ke semula
    }
  };
  

  if (!data) return <p style={{ padding: 24 }}>Memuat kwitansi...</p>;

  const { nomor, namaPengirim, dataPendaftaran } = data;

  return (
    <div style={{ padding: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <div
        ref={kwitansiRef}
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #ccc',
          padding: '40px',
          width: '100%',
          maxWidth: '640px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px',
          fontFamily: 'sans-serif',
          color: '#000000',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img
            src="/desain-p3k.png"
            alt="Logo P3K"
            style={{ width: '80px', height: 'auto', marginBottom: '8px' }}
          />
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Kwitansi Pembayaran</h1>
          <p style={{ fontSize: '14px', color: '#666666' }}>P3K 2025</p>
        </div>

        <table style={{ width: '100%', fontSize: '14px', marginBottom: '16px' }}>
          <tbody>
            <tr>
              <td style={{ fontWeight: '600', width: '160px' }}>Nomor Kwitansi</td>
              <td>: {nomor}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: '600' }}>Nama Sekolah</td>
              <td>: {dataPendaftaran.sekolah.nama}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: '600' }}>Pembina</td>
              <td>: {dataPendaftaran.sekolah.pembina}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: '600' }}>WhatsApp</td>
              <td>: {dataPendaftaran.sekolah.whatsapp}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: '600' }}>Kategori</td>
              <td>: {dataPendaftaran.sekolah.kategori}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: '600' }}>Nama Pengirim</td>
              <td>: {namaPengirim}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontWeight: '600', marginBottom: '4px' }}>Lomba yang Diikuti :</h2>
          <ul style={{ paddingLeft: '20px', fontSize: '14px', margin: 0 }}>
            {Object.entries(dataPendaftaran.lombaDipilih).map(([namaLomba, jumlah]) => (
              <li key={namaLomba}>
                {namaLomba} – {jumlah} tim
              </li>
            ))}
          </ul>
        </div>

        <div style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 600 }}>
          Total Jumlah Peserta :{" "}
          {
            Object.values(dataPendaftaran.peserta).reduce((total, pesertaList) => total + pesertaList.length, 0)
          }
        </div>

        <div
          style={{
            backgroundColor: '#d1fae5',
            borderLeft: '4px solid #10b981',
            color: '#065f46',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
          }}
        >
          <p style={{ fontWeight: 'bold', fontSize: '18px' }}>
            Total Pembayaran: Rp {dataPendaftaran.totalBayar.toLocaleString('id-ID')}
          </p>
        </div>

        <div style={{ textAlign: 'right', fontSize: '14px', marginTop: '32px' }}>
          <p>Hormat Kami,</p>
          <p style={{ marginTop: '48px' }}>(Panitia P3K 2025)</p>
        </div>
      </div>

      <button
        onClick={handleDownload}
        style={{
          backgroundColor: '#16a34a',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: 8,
          border: 'none',
          cursor: 'pointer',
          fontSize: 16,
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#15803d')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')}
      >
        Download Kwitansi
      </button>
    </div>
  );
}
