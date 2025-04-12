'use client';

import { useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import html2pdf from 'html2pdf.js';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function SuksesContent() {
  const cetakRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  const kode_unit = searchParams.get('kode_unit') || '';
  const nama_sekolah = searchParams.get('nama_sekolah') || '';
  const nama_pengirim = searchParams.get('nama_pengirim') || '';
  const whatsapp = searchParams.get('whatsapp') || '';
  const kategori = searchParams.get('kategori') || '';
  const total = searchParams.get('total') || '';

  const handleDownload = () => {
    if (cetakRef.current) {
      html2pdf().from(cetakRef.current).save(`Kwitansi-${kode_unit}.pdf`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-orange-100 px-4 py-10 text-orange-900">
      <div className="max-w-2xl mx-auto bg-white border shadow-md rounded-lg p-6">
        <div ref={cetakRef} className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <Image src="/desain-p3k.png" alt="Logo P3K" width={160} height={0} />
            <h1 className="text-lg font-bold text-orange-700">Kwitansi Pendaftaran</h1>
          </div>

          <div className="text-sm space-y-1">
            <p><strong>Kode Unit:</strong> {kode_unit}</p>
            <p><strong>Nama Sekolah:</strong> {nama_sekolah}</p>
            <p><strong>Nama Pengirim:</strong> {nama_pengirim}</p>
            <p><strong>WhatsApp:</strong> {whatsapp}</p>
            <p><strong>Kategori:</strong> {kategori}</p>
            <p><strong>Total Biaya:</strong> Rp {parseInt(total || '0').toLocaleString('id-ID')}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700 text-white">
            Unduh Kwitansi
          </Button>
        </div>
      </div>
    </div>
  );
}
