'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

const KwitansiClient = dynamic(() => import('@/components/KwitansiClient'), { ssr: false });

export default function SuksesContent() {
  const searchParams = useSearchParams();

  const kode_unit = searchParams.get('kode_unit') || '';
  const nama_sekolah = searchParams.get('nama_sekolah') || '';
  const nama_pengirim = searchParams.get('nama_pengirim') || '';
  const whatsapp = searchParams.get('whatsapp') || '';
  const kategori = searchParams.get('kategori') || '';
  const total = searchParams.get('total') || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-orange-100 px-4 py-10 text-orange-900">
      <KwitansiClient
        kode_unit={kode_unit}
        nama_sekolah={nama_sekolah}
        nama_pengirim={nama_pengirim}
        whatsapp={whatsapp}
        kategori={kategori}
        total={total}
      />
    </div>
  );
}
