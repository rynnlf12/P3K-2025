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
  searchParams.forEach((val, key) => {
    if (!['kode_unit', 'nama_sekolah', 'nama_pengirim', 'whatsapp', 'kategori', 'total'].includes(key)) {
      const jumlah = parseInt(val || '0');
      if (jumlah > 0) rincian.push({ nama: key, jumlah, biaya: 20000 });
    }
  });

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/downlaod-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          kode_unit,
          nama_sekolah,
          nama_pengirim,
          whatsapp,
          kategori,
          total,
          rincian
        }),
      });

      if (!res.ok) throw new Error('Gagal membuat PDF');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Kwitansi_${nama_sekolah}_${kode_unit}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('❌ Gagal mengunduh kwitansi:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <CheckCircle size={48} color="#16a34a" />
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Pendaftaran Berhasil!</h1>
        <p>Silakan unduh kwitansi sebagai bukti pendaftaran.</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={handleDownload}
          disabled={loading}
          style={{
            backgroundColor: '#2563eb',
            color: '#fff',
            padding: '10px 20px',
            fontSize: '16px',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Memproses...' : 'Unduh Kwitansi (PDF)'}
        </button>
      </div>
    </div>
  );
}