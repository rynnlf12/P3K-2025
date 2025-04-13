'use client';

import { useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function SuksesContent() {
  const searchParams = useSearchParams();
  const kode_unit = searchParams.get('kode_unit') || '';
  const nama_sekolah = searchParams.get('nama_sekolah') || '';
  const nama_pengirim = searchParams.get('nama_pengirim') || '';
  const whatsapp = searchParams.get('whatsapp') || '';
  const kategori = searchParams.get('kategori') || '';
  const total = searchParams.get('total') || '';
  const rincian: { nama: string; jumlah: number; biaya: number }[] = [];
  searchParams.forEach((value, key) => {
    if (!['kode_unit', 'nama_sekolah', 'nama_pengirim', 'whatsapp', 'kategori', 'total'].includes(key)) {
      const jumlah = parseInt(value || '0');
      if (jumlah > 0) rincian.push({ nama: key, jumlah, biaya: 20000 });
    }
  });

  const handleDownload = async () => {
    try {
      const response = await fetch('/api/pdfgen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kode_unit, nama_sekolah, nama_pengirim, whatsapp, kategori, total, rincian }),
      });
      if (!response.ok) throw new Error('Gagal membuat PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = \`kwitansi_\${nama_sekolah}_\${kode_unit}.pdf\`;
      link.click();
    } catch (error) {
      console.error('❌ Gagal mengunduh kwitansi:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 px-4 py-12 pt-32">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto animate-ping" />
          <h1 className="text-3xl font-bold text-green-700">Pendaftaran Berhasil!</h1>
          <p className="text-orange-600">Silakan unduh kwitansi sebagai bukti pendaftaran.</p>
        </div>
        <div className="text-center mt-6">
          <button onClick={handleDownload} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow">
            Unduh Kwitansi
          </button>
        </div>
      </div>
    </div>
  );
}