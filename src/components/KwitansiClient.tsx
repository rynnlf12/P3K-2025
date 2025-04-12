'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';



type Props = {
  kode_unit: string;
  nama_sekolah: string;
  nama_pengirim: string;
  whatsapp: string;
  kategori: string;
  total: string;
};

const convertImageToBase64 = async (url: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
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
        const imgBase64 = await convertImageToBase64('/desain.p3k.png'); 
        const worker = new Worker(new URL('/public/pdf.worker.js', import.meta.url));

      worker.postMessage({
        data: {
          kode_unit,
          nama_sekolah,
          nama_pengirim,
          whatsapp,
          kategori,
          total: parseInt(total || '0').toLocaleString('id-ID')
        },
        imgBase64
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

      worker.onerror = (error) => {
        console.error('Worker error:', error);
        worker.terminate();
      };

    } catch (error) {
        console.error('Download error:', error);
      } finally {
        setIsDownloading(false);
      }
};

  return (
    <div className="max-w-2xl mx-auto bg-white border shadow-md rounded-lg p-6">
      <div ref={cetakRef} className="space-y-4">
        {/* ... (existing JSX remains the same) */}
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