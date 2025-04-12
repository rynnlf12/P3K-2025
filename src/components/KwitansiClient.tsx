'use client';

import { useRef, useState } from 'react';
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
  const [isDownloading, setIsDownloading] = useState(false);
  const cetakRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const worker = new Worker(new URL('/public/pdf.worker.js', import.meta.url));
      
      worker.postMessage({
        data: {
          kode_unit,
          nama_sekolah,
          nama_pengirim,
          whatsapp,
          kategori,
          total: parseInt(total || '0').toLocaleString('id-ID')
        }
      });

      worker.onmessage = (e) => {
        const pdfBlob = e.data.pdfBlob;
        const url = window.URL.createObjectURL(pdfBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `Kwitansi-${kode_unit}.pdf`;
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        worker.terminate();
      };

    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pt-32 bg-white border shadow-md rounded-lg p-6">
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
        <Button 
          onClick={handleDownload}
          disabled={isDownloading}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isDownloading ? 'Mengunduh...' : 'Unduh Kwitansi'}
        </Button>
      </div>
    </div>
  );
}
