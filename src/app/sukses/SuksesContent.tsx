'use client';

import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { CheckCircle } from 'lucide-react';

const KwitansiClient = dynamic(() => import('@/components/KwitansiClient'), { ssr: false });

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
    const skip = ['kode_unit', 'nama_sekolah', 'nama_pengirim', 'whatsapp', 'kategori', 'total'];
    if (!skip.includes(key)) {
      const jumlah = parseInt(value || '0');
      if (jumlah > 0) {
        rincian.push({ nama: key, jumlah, biaya: 20000 });
      }
    }
  });

  return (
    <div style={{
      minHeight: '100vh',
      padding: '3rem 1rem',
      background: 'linear-gradient(to bottom right, #FEFCE8, #FFEDD5)'
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', paddingTop: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <CheckCircle size={64} color="#16a34a" />
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#15803d' }}>Pendaftaran Berhasil!</h1>
          <p style={{ color: '#ea580c' }}>Data Anda telah tersimpan. Silakan unduh kwitansi sebagai bukti pendaftaran.</p>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            rowGap: '0.75rem',
            columnGap: '1rem',
            fontSize: '0.875rem'
          }}>
            <div><p style={{ fontWeight: 600, color: '#ea580c' }}>Kode Unit</p><p>{kode_unit}</p></div>
            <div><p style={{ fontWeight: 600, color: '#ea580c' }}>Nama Sekolah</p><p>{nama_sekolah}</p></div>
            <div><p style={{ fontWeight: 600, color: '#ea580c' }}>Nama Pengirim</p><p>{nama_pengirim}</p></div>
            <div><p style={{ fontWeight: 600, color: '#ea580c' }}>WhatsApp</p><p>{whatsapp}</p></div>
            <div><p style={{ fontWeight: 600, color: '#ea580c' }}>Kategori</p><p>{kategori}</p></div>
            <div><p style={{ fontWeight: 600, color: '#ea580c' }}>Total Bayar</p><p>Rp {parseInt(total || '0').toLocaleString('id-ID')}</p></div>
          </div>
        </div>

        <KwitansiClient
          kode_unit={kode_unit}
          nama_sekolah={nama_sekolah}
          nama_pengirim={nama_pengirim}
          whatsapp={whatsapp}
          kategori={kategori}
          total={total}
          rincian={rincian}
        />

        <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#ea580c', marginTop: '2rem' }}>
          <p>✉️ Kwitansi juga dikirim ke WhatsApp Anda</p>
          <p>📞 Hubungi panitia jika ada pertanyaan</p>
        </div>
      </div>
    </div>
  );
}
