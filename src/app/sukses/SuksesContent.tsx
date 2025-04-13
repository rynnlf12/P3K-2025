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
    const exclude = ['kode_unit', 'nama_sekolah', 'nama_pengirim', 'whatsapp', 'kategori', 'total'];
    if (!exclude.includes(key)) {
      const jumlah = parseInt(val || '0');
      if (jumlah > 0) rincian.push({ nama: key, jumlah, biaya: 20000 });
    }
  });

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/download-pdf', {
        method: 'POST',
        body: JSON.stringify({
          kode_unit,
          nama_sekolah,
          nama_pengirim,
          whatsapp,
          kategori,
          total,
          rincian,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Gagal membuat PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Kwitansi_${nama_sekolah}_${kode_unit}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('❌ Gagal mengunduh kwitansi:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <CheckCircle size={64} color="#22c55e" />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#15803d' }}>Pendaftaran Berhasil!</h1>
        <p style={{ color: '#92400e' }}>Silakan unduh kwitansi sebagai bukti pendaftaran.</p>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', background: '#fff', padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '0.75rem' }}>
        <p><strong>Kode Unit:</strong> {kode_unit}</p>
        <p><strong>Nama Sekolah:</strong> {nama_sekolah}</p>
        <p><strong>Nama Pengirim:</strong> {nama_pengirim}</p>
        <p><strong>WhatsApp:</strong> {whatsapp}</p>
        <p><strong>Kategori:</strong> {kategori}</p>
        <p><strong>Total:</strong> Rp {parseInt(total || '0').toLocaleString('id-ID')}</p>
        <hr style={{ margin: '1rem 0' }} />
        <p><strong>Rincian Lomba:</strong></p>
        <ul>
          {rincian.map((item, i) => (
            <li key={i}>{item.nama} x {item.jumlah} tim = Rp {(item.jumlah * item.biaya).toLocaleString('id-ID')}</li>
          ))}
        </ul>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <button onClick={handleDownload} disabled={loading} style={{
          backgroundColor: '#059669',
          color: '#fff',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          fontSize: '1rem',
          border: 'none',
          cursor: 'pointer'
        }}>
          {loading ? 'Memproses...' : 'Unduh Kwitansi PDF'}
        </button>
      </div>
    </div>
  );
}
