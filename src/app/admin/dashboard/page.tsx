'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Pendaftaran = {
  id: string;
  nama_pengirim: string;
  data: any; // bisa disesuaikan jadi tipe DataPendaftaran jika perlu
  status: 'pending' | 'disetujui' | 'ditolak';
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<Pendaftaran[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendaftaran();
  }, []);

  const fetchPendaftaran = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pendaftaran')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setData(data as Pendaftaran[]);
    setLoading(false);
  };

  const handleApprove = async (pendaftar: Pendaftaran) => {
    const nomor = generateNomor(pendaftar);
    const whatsapp = pendaftar.data?.sekolah?.whatsapp || '';
    const url = `https://p3k2025.vercel.app/kwitansi?namaPengirim=${encodeURIComponent(pendaftar.nama_pengirim)}`;
    const message = `Halo! Pendaftaran sekolah ${pendaftar.data?.sekolah?.nama} telah disetujui. Berikut link kwitansi pembayaran:\n\n${url}`;
    const waLink = `https://wa.me/${whatsapp.replace(/^0/, '62')}?text=${encodeURIComponent(message)}`;

    await supabase.from('pendaftaran').update({ status: 'disetujui' }).eq('id', pendaftar.id);
    window.open(waLink, '_blank');
    fetchPendaftaran();
  };

  const handleReject = async (id: string) => {
    await supabase.from('pendaftaran').update({ status: 'ditolak' }).eq('id', id);
    fetchPendaftaran();
  };

  const generateNomor = (p: Pendaftaran) => {
    const sekolah = p.data?.sekolah?.nama || 'SEKOLAH';
    const pad = (n: number) => String(n).padStart(2, '0');
    const now = new Date();
    const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const timestamp = `${wib.getFullYear()}${pad(wib.getMonth() + 1)}${pad(wib.getDate())}${pad(wib.getHours())}${pad(wib.getMinutes())}`;
    return `P3K2025-${sekolah.replace(/\s+/g, '').toUpperCase().slice(0, 10)}-${timestamp}`;
  };

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 24 }}>Dashboard Admin</h1>
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
              <th>Sekolah</th>
              <th>Nama Pengirim</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{item.data?.sekolah?.nama}</td>
                <td>{item.nama_pengirim}</td>
                <td>{item.status}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  {item.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(item)}
                        style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6 }}
                      >
                        Setujui
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6 }}
                      >
                        Tolak
                      </button>
                    </>
                  )}
                  {item.status !== 'pending' && <span>Tidak ada aksi</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
