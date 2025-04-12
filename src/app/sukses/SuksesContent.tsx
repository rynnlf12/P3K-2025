'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

const KwitansiClient = dynamic(() => import('@/components/KwitansiClient'), { ssr: false });

export default function SuksesContent() {
  const searchParams = useSearchParams();

  // Ambil parameter dari URL
  const params = {
    kode_unit: searchParams.get('kode_unit') || '',
    nama_sekolah: searchParams.get('nama_sekolah') || '',
    nama_pengirim: searchParams.get('nama_pengirim') || '',
    whatsapp: searchParams.get('whatsapp') || '',
    kategori: searchParams.get('kategori') || '',
    total: searchParams.get('total') || ''
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Success */}
        <div className="text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto animate-bounce" />
          <h1 className="text-3xl font-bold text-green-700">
            Pendaftaran Berhasil!
          </h1>
          <p className="text-orange-600">
            Data Anda telah tersimpan. Silakan unduh kwitansi sebagai bukti pendaftaran.
          </p>
        </div>

        {/* Informasi Penting */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-orange-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-orange-700">Kode Unit</p>
              <p className="text-orange-900">{params.kode_unit}</p>
            </div>
            <div>
              <p className="font-semibold text-orange-700">Nama Sekolah</p>
              <p className="text-orange-900">{params.nama_sekolah}</p>
            </div>
            <div>
              <p className="font-semibold text-orange-700">Kategori</p>
              <p className="text-orange-900">{params.kategori}</p>
            </div>
            <div>
              <p className="font-semibold text-orange-700">Total Pembayaran</p>
              <p className="text-orange-900">
                Rp {parseInt(params.total || '0').toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>

        {/* Komponen Kwitansi */}
        <div className="bg-white rounded-lg shadow-xl border border-orange-200 overflow-hidden">
          <KwitansiClient {...params} />
        </div>

        {/* Informasi Tambahan */}
        <div className="text-center text-sm text-orange-600 space-y-2">
          <p>✉️ Kwitansi akan dikirim juga melalui WhatsApp yang terdaftar</p>
          <p>📞 Hubungi 0822-8968-XXX jika ada pertanyaan</p>
        </div>
      </div>
    </div>
  );
}