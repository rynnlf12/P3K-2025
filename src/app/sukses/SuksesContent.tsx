'use client';

import { useSearchParams } from 'next/navigation';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function SuksesContent() {
  const searchParams = useSearchParams();
  const cetakRef = useRef<HTMLDivElement>(null);

  const kode_unit = searchParams.get('kode_unit') || '';
  const nama_sekolah = searchParams.get('nama_sekolah') || '';
  const nama_pengirim = searchParams.get('nama_pengirim') || '';
  const whatsapp = searchParams.get('whatsapp') || '';
  const total = searchParams.get('total') || '';

  const handleCetak = async () => {
    if (!cetakRef.current) return;
    const html2pdf = (await import('html2pdf.js')).default;

    html2pdf()
      .from(cetakRef.current)
      .set({
        margin: 10,
        filename: `${kode_unit}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .save();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 px-4 py-10">
      <div className="max-w-2xl mx-auto bg-white border shadow p-6 rounded space-y-6">
        <div ref={cetakRef} className="text-sm space-y-4">
          <div className="flex justify-center">
            <Image
              src="/desain-p3k.png"
              alt="Logo P3K"
              width={160}
              height={0}
              className="object-contain h-auto"
            />
          </div>

          <h1 className="text-2xl font-bold text-center text-orange-700">Kwitansi Pembayaran</h1>

          <div className="text-gray-800">
            <p><strong>Kode Unit:</strong> {kode_unit}</p>
            <p><strong>Nama Sekolah:</strong> {nama_sekolah}</p>
            <p><strong>Nama Pengirim:</strong> {nama_pengirim}</p>
            <p><strong>WhatsApp:</strong> {whatsapp}</p>
          </div>

          <div className="border-t pt-3">
            <p className="text-orange-800 font-semibold">Rincian Biaya:</p>
            <p>Total Pembayaran: <strong>Rp {Number(total).toLocaleString('id-ID')}</strong></p>
          </div>

          <p className="text-gray-600 text-xs italic">
            Harap simpan kwitansi ini sebagai bukti pembayaran resmi kegiatan P3K 2025.
          </p>
        </div>

        <div className="text-center">
          <Button onClick={handleCetak} className="bg-green-600 hover:bg-green-700 text-white mt-4">
            Unduh Kwitansi PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
