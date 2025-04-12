'use client';

import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { CheckCircle } from 'lucide-react';

// Import KwitansiClient secara dinamis agar hanya dirender di sisi client
const KwitansiClient = dynamic(() => import('@/components/KwitansiClient'), { ssr: false });

export default function SuksesContent() {
  const searchParams = useSearchParams();

  // Ambil parameter dari URL
  const kode_unit = searchParams.get('kode_unit') || '';
  const nama_sekolah = searchParams.get('nama_sekolah') || '';
  const nama_pengirim = searchParams.get('nama_pengirim') || '';
  const whatsapp = searchParams.get('whatsapp') || '';
  const kategori = searchParams.get('kategori') || '';
  const total = searchParams.get('total') || '';

  // Filter & proses parameter rincian lomba
  const rincian: { nama: string; jumlah: number; biaya: number }[] = [];
  searchParams.forEach((value, key) => {
    const exclude = ['kode_unit', 'nama_sekolah', 'nama_pengirim', 'whatsapp', 'kategori', 'total'];
    if (!exclude.includes(key)) {
      const jumlah = parseInt(value || '0');
      const biaya = 20000; // default biaya (bisa disesuaikan dari LOMBA_LIST jika perlu)
      if (jumlah > 0) {
        rincian.push({ nama: key, jumlah, biaya });
      }
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 px-4 py-12 pt-32">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Notifikasi Sukses */}
        <div className="text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto animate-ping" />
          <h1 className="text-3xl font-bold text-green-700">Pendaftaran Berhasil!</h1>
          <p className="text-orange-600">
            Data Anda telah tersimpan. Silakan unduh kwitansi sebagai bukti pendaftaran.
          </p>
        </div>

        {/* Info Sekolah */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-orange-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-orange-700">Kode Unit</p>
              <p className="text-orange-900 break-all">{kode_unit}</p>
            </div>
            <div>
              <p className="font-semibold text-orange-700">Nama Sekolah</p>
              <p className="text-orange-900">{nama_sekolah}</p>
            </div>
            <div>
              <p className="font-semibold text-orange-700">Nama Pengirim</p>
              <p className="text-orange-900">{nama_pengirim}</p>
            </div>
            <div>
              <p className="font-semibold text-orange-700">WhatsApp</p>
              <p className="text-orange-900">{whatsapp}</p>
            </div>
            <div>
              <p className="font-semibold text-orange-700">Kategori</p>
              <p className="text-orange-900">{kategori}</p>
            </div>
            <div>
              <p className="font-semibold text-orange-700">Total Bayar</p>
              <p className="text-orange-900">Rp {parseInt(total || '0').toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>

        {/* Komponen Kwitansi */}
        <KwitansiClient
          kode_unit={kode_unit}
          nama_sekolah={nama_sekolah}
          nama_pengirim={nama_pengirim}
          whatsapp={whatsapp}
          kategori={kategori}
          total={total}
          rincian={rincian}
        />

        {/* Footer Info */}
        <div className="text-center text-sm text-orange-600 space-y-2">
          <p>✉️ Kwitansi akan dikirim juga melalui WhatsApp yang terdaftar</p>
          <p>📞 Hubungi panitia jika ada pertanyaan atau kendala teknis</p>
        </div>
      </div>
    </div>
  );
}
