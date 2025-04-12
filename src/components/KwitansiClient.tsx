'use client';

import { useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

type Props = {
  kode_unit: string;
  nama_sekolah: string;
  nama_pengirim: string;
  whatsapp: string;
  kategori: string;
  total: string;
};

export default function KwitansiClient({
  kode_unit,
  nama_sekolah,
  nama_pengirim,
  whatsapp,
  kategori,
  total,
}: Props) {
  const cetakRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (cetakRef.current) {
      const opt = {
        margin: 0.5,
        filename: `Kwitansi-${kode_unit}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(cetakRef.current).save();
    }
  };

  return (
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
  );
}
