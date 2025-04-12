'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import html2canvas from 'html2canvas';

export default function KwitansiClient({
  kode_unit,
  nama_sekolah,
  nama_pengirim,
  whatsapp,
  kategori,
  total,
  rincian,
}: {
  kode_unit: string;
  nama_sekolah: string;
  nama_pengirim: string;
  whatsapp: string;
  kategori: string;
  total: string;
  rincian: { nama: string; jumlah: number; biaya: number }[];
}) {
  const cetakRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!cetakRef.current) return;
    setLoading(true);

    try {
      const canvas = await html2canvas(cetakRef.current);
      const image = canvas.toDataURL('image/jpeg', 1.0);

      // Preview dulu
      setPreviewUrl(image);

      // Trigger download
      const link = document.createElement('a');
      link.href = image;
      link.download = `Kwitansi_${kode_unit}.jpg`;
      link.click();
    } catch (err) {
      console.error('❌ Gagal membuat kwitansi:', err);
      alert('Gagal mengunduh kwitansi. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Konten kwitansi yang akan diubah menjadi gambar */}
      <div
        ref={cetakRef}
        className="bg-white text-black p-6 rounded-md shadow max-w-2xl mx-auto border border-gray-300"
      >
        <div className="flex items-center justify-between border-b pb-2 mb-4">
          <Image src="/desain-p3k.png" alt="Logo P3K" width={120} height={40} />
          <div className="text-right text-sm">
            <p className="text-gray-600">Kode Unit:</p>
            <strong className="text-orange-700">{kode_unit}</strong>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-center mb-4 text-red-700">
          Kwitansi Pembayaran
        </h2>

        <div className="text-sm space-y-1">
          <p><strong>Nama Sekolah:</strong> {nama_sekolah}</p>
          <p><strong>Nama Pengirim:</strong> {nama_pengirim}</p>
          <p><strong>WhatsApp:</strong> {whatsapp}</p>
          <p><strong>Kategori:</strong> {kategori}</p>
        </div>

        <div className="mt-4 text-sm">
          <p className="font-semibold mb-2">Rincian Biaya:</p>
          <ul className="list-disc list-inside space-y-1">
            {rincian.map((r, i) => (
              <li key={i}>
                {r.nama} × {r.jumlah} tim = <strong>Rp {(r.jumlah * r.biaya).toLocaleString('id-ID')}</strong>
              </li>
            ))}
          </ul>
          <p className="mt-2 font-bold text-orange-700">Total: Rp {Number(total).toLocaleString('id-ID')}</p>
        </div>

        <p className="text-xs text-center mt-6 text-gray-500 italic">
          Dokumen ini dicetak otomatis oleh sistem dan tidak memerlukan tanda tangan.
        </p>
      </div>

      {/* Tombol Download */}
      <div className="text-center">
        <button
          onClick={handleDownload}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded shadow transition disabled:opacity-60"
        >
          {loading ? 'Mengunduh...' : 'Unduh Kwitansi'}
        </button>
      </div>

      {/* Preview Gambar */}
      {previewUrl && (
        <div className="mt-6 text-center">
          <p className="text-sm mb-2 text-gray-600">📄 Pratinjau Kwitansi:</p>
          <img src={previewUrl} alt="Preview Kwitansi" className="max-w-xs mx-auto border shadow" />
        </div>
      )}
    </div>
  );
}
