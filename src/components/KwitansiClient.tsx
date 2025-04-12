'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import html2pdf from 'html2pdf.js';

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

  const handleDownload = async () => {
    if (!cetakRef.current) return;
    setLoading(true);

    const element = cetakRef.current;

    setTimeout(() => {
      html2pdf()
        .set({
          margin: 10,
          filename: `Kwitansi_${nama_sekolah}_${kode_unit}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(element)
        .save()
        .finally(() => setLoading(false));
    }, 200); // Delay pendek untuk memastikan render selesai
  };

  return (
    <div className="space-y-6">
      {/* Konten PDF */}
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

        <h2 className="text-xl font-semibold text-center mb-4 text-red-700">Kwitansi Pembayaran</h2>

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
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded shadow transition flex items-center justify-center gap-2 mx-auto"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Memproses...
            </>
          ) : (
            'Unduh Kwitansi'
          )}
        </button>
      </div>
    </div>
  );
}
