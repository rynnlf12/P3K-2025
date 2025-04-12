'use client';

import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';

export default function KwitansiClient({
  kode_unit,
  nama_sekolah,
  nama_pengirim,
  whatsapp,
  kategori,
  total,
  rincian,
}: {
  kode_unit: string;
  nama_sekolah: string;
  nama_pengirim: string;
  whatsapp: string;
  kategori: string;
  total: string;
  rincian: { nama: string; jumlah: number; biaya: number }[];
}) {
  const cetakRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!cetakRef.current) return;
    setLoading(true);
  
    try {
      const canvas = await html2canvas(cetakRef.current, {
        backgroundColor: '#ffffff',
        useCORS: true,
        scale: 2,
        ignoreElements: (el) => {
          const styles = getComputedStyle(el);
          return (
            styles.color.includes('oklch') ||
            styles.backgroundColor.includes('oklch') ||
            styles.borderColor.includes('oklch')
          );
        },
      });
      const imgData = canvas.toDataURL('image/jpeg');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `Kwitansi_${nama_sekolah}_${kode_unit}.jpg`;
      link.click();
    } catch (error) {
      console.error('❌ Gagal membuat kwitansi:', error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div style={{ marginTop: '2rem', marginBottom: '3rem' }}>
      <div
        ref={cetakRef}
        style={{
          all: 'initial',
          backgroundColor: '#ffffff',
          color: '#000000',
          fontFamily: 'Arial, sans-serif',
          padding: '24px',
          borderRadius: '12px',
          maxWidth: '700px',
          margin: '0 auto',
          border: '1px solid #d1d5db',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '8px',
            marginBottom: '16px',
          }}
        >
          <img src="/desain-p3k.png" alt="Logo P3K" style={{ width: '120px', height: 'auto' }} />
          <div style={{ textAlign: 'right', fontSize: '14px' }}>
            <p style={{ color: '#6b7280', margin: 0 }}>Kode Unit:</p>
            <strong style={{ color: '#c2410c' }}>{kode_unit}</strong>
          </div>
        </div>

        <h2
          style={{
            fontSize: '20px',
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: '20px',
            color: '#b91c1c',
          }}
        >
          Kwitansi Pembayaran
        </h2>

        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <p><strong>Nama Sekolah:</strong> {nama_sekolah}</p>
          <p><strong>Nama Pengirim:</strong> {nama_pengirim}</p>
          <p><strong>WhatsApp:</strong> {whatsapp}</p>
          <p><strong>Kategori:</strong> {kategori}</p>
        </div>

        <div style={{ marginTop: '16px', fontSize: '14px' }}>
          <p style={{ fontWeight: 600, marginBottom: '8px' }}>Rincian Biaya:</p>
          <ul style={{ listStyle: 'disc', paddingLeft: '20px', margin: 0 }}>
            {rincian.map((r, i) => (
              <li key={i}>
                {r.nama} × {r.jumlah} tim ={' '}
                <strong>Rp {(r.jumlah * r.biaya).toLocaleString('id-ID')}</strong>
              </li>
            ))}
          </ul>
          <p style={{ marginTop: '12px', fontWeight: 'bold', color: '#c2410c' }}>
            Total: Rp {Number(total).toLocaleString('id-ID')}
          </p>
        </div>

        <p
          style={{
            fontSize: '12px',
            textAlign: 'center',
            marginTop: '24px',
            color: '#6b7280',
            fontStyle: 'italic',
          }}
        >
          Dokumen ini dicetak otomatis oleh sistem dan tidak memerlukan tanda tangan.
        </p>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={handleDownload}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#9ca3af' : '#059669',
            color: '#ffffff',
            padding: '10px 24px',
            fontSize: '16px',
            borderRadius: '8px',
            border: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {loading ? 'Memproses...' : 'Unduh Kwitansi'}
        </button>
      </div>
    </div>
  );
}
