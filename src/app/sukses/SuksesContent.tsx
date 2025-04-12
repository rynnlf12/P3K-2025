'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

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
  searchParams.forEach((value, key) => {
    const exclude = ['kode_unit', 'nama_sekolah', 'nama_pengirim', 'whatsapp', 'kategori', 'total'];
    if (!exclude.includes(key)) {
      const jumlah = parseInt(value || '0');
      const biaya = 20000;
      if (jumlah > 0) {
        rincian.push({ nama: key, jumlah, biaya });
      }
    }
  });

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/kwitansi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

      if (!res.ok) throw new Error('Gagal membuat PDF');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Kwitansi_${nama_sekolah}_${kode_unit}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('❌ Gagal mengunduh kwitansi:', err);
      alert('Terjadi kesalahan saat mengunduh kwitansi.');
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
          <p className="text-orange-600">
            Data Anda telah tersimpan. Silakan unduh kwitansi sebagai bukti pendaftaran.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-orange-200 text-sm space-y-2">
          <p><strong>Kode Unit:</strong> {kode_unit}</p>
          <p><strong>Nama Sekolah:</strong> {nama_sekolah}</p>
          <p><strong>Nama Pengirim:</strong> {nama_pengirim}</p>
          <p><strong>WhatsApp:</strong> {whatsapp}</p>
          <p><strong>Kategori:</strong> {kategori}</p>
          <p><strong>Total:</strong> Rp {parseInt(total).toLocaleString('id-ID')}</p>
        </div>

        <div className="text-center">
          <button
            onClick={handleDownload}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded shadow"
          >
            {loading ? 'Memproses Kwitansi...' : 'Unduh Kwitansi PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
