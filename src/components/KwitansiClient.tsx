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
    console.log('[1] Tombol diklik - Mulai proses unduh');
    setIsDownloading(true);
    
    try {
        console.log('[2] Init worker');
        const worker = new Worker(new URL('/Public/pdf.worker.js', import.meta.url));
      
      const imgResponse = await fetch('/desain-p3k.png');
      const imgBlob = await imgResponse.blob();
      const imgBase64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(imgBlob);
    });
    
      console.log('[3] Mengirim data ke worker:', {
        kode_unit,
        nama_sekolah,
        nama_pengirim,
        whatsapp,
        kategori,
        total: parseInt(total || '0').toLocaleString('id-ID'),

        imgBase64
      });
      


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
        console.log('[4] Message from worker:', e.data);
        if(e.data.pdfBlob) {
          console.log('[5] Blob size:', e.data.pdfBlob.size);
          const url = URL.createObjectURL(e.data.pdfBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `test.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        }
        worker.terminate();
      };
  
      worker.onerror = (error) => {
        console.error('[Worker Error]', error);
        worker.terminate();
      };
      
  
    } catch (error) {
      console.error('[Main Error]', error);
    } finally {
      console.log('[7] Proses selesai');
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
