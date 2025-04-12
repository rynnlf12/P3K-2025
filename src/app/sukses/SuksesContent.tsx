// SuksesContent.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function SuksesContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const kode_unit = searchParams.get('kode_unit') || '';
  const nama_sekolah = searchParams.get('nama_sekolah') || '';
  const nama_pengirim = searchParams.get('nama_pengirim') || '';
  const whatsapp = searchParams.get('whatsapp') || '';
  const kategori = searchParams.get('kategori') || '';
  const total = searchParams.get('total') || '';

  const rincian: { nama: string; jumlah: number; biaya: number }[] = [];
  searchParams.forEach((val, key) => {
    if (!['kode_unit', 'nama_sekolah', 'nama_pengirim', 'whatsapp', 'kategori', 'total'].includes(key)) {
      const jumlah = parseInt(val);
      if (jumlah > 0) {
        rincian.push({ nama: key, jumlah, biaya: 20000 });
      }
    }
  });

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/kwitansi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kode_unit,
          nama_sekolah,
          nama_pengirim,
          whatsapp,
          kategori,
          total,
          rincian,
        }),
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Kwitansi_${nama_sekolah}_${kode_unit}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('❌ Gagal mengunduh kwitansi:', err);
    } finally {
      setLoading(false);
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

        <div className="bg-white rounded-lg shadow-lg p-6 border border-orange-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><p className="font-semibold text-orange-700">Kode Unit</p><p>{kode_unit}</p></div>
            <div><p className="font-semibold text-orange-700">Nama Sekolah</p><p>{nama_sekolah}</p></div>
            <div><p className="font-semibold text-orange-700">Nama Pengirim</p><p>{nama_pengirim}</p></div>
            <div><p className="font-semibold text-orange-700">WhatsApp</p><p>{whatsapp}</p></div>
            <div><p className="font-semibold text-orange-700">Kategori</p><p>{kategori}</p></div>
            <div><p className="font-semibold text-orange-700">Total</p><p>Rp {parseInt(total).toLocaleString('id-ID')}</p></div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleDownload}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow"
          >
            {loading ? 'Memproses...' : 'Unduh Kwitansi'}
          </button>
        </div>
      </div>
    </div>
  );
}
