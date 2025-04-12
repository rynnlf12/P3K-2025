
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
    if (!['kode_unit', 'nama_sekolah', 'nama_pengirim', 'whatsapp', 'kategori', 'total'].includes(key)) {
      const jumlah = parseInt(value || '0');
      const biaya = 20000;
      if (jumlah > 0) {
        rincian.push({ nama: key, jumlah, biaya });
      }
    }
  });

  return (
    <div className="min-h-screen bg-yellow-50 px-4 py-12 pt-32">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto animate-bounce" />
          <h1 className="text-3xl font-bold text-green-700">Pendaftaran Berhasil!</h1>
          <p className="text-orange-600">Silakan unduh kwitansi sebagai bukti pendaftaran.</p>
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
      </div>
    </div>
  );
}
