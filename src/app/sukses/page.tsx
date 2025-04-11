'use client';
export const dynamic = "force-dynamic";

import { useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { LOMBA_LIST } from '@/data/lomba';

export default function SuksesPage() {
  const searchParams = useSearchParams();
  const cetakRef = useRef<HTMLDivElement>(null);

  const kode_unit = searchParams.get('kode_unit') || '';
  const nama_sekolah = searchParams.get('nama_sekolah') || '';
  const nama_pengirim = searchParams.get('nama_pengirim') || '';
  const whatsapp = searchParams.get('whatsapp') || '';
  const kategori = searchParams.get('kategori') || '';
  const totalBayar = searchParams.get('total') || '';

  const lombaDipilih: Record<string, number> = {};
  LOMBA_LIST.forEach((l) => {
    const val = searchParams.get(l.id);
    if (val) lombaDipilih[l.id] = parseInt(val);
  });

  const handleDownload = async () => {
    if (!cetakRef.current) return;
    const html2pdf = (await import('html2pdf.js')).default;
    html2pdf()
      .set({ filename: `${kode_unit}.pdf` })
      .from(cetakRef.current)
      .save();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white px-4 py-10 text-green-900">
      <div className="max-w-2xl mx-auto bg-white border p-6 rounded-lg shadow space-y-6">
        <h1 className="text-2xl font-bold text-green-700 text-center">Pembayaran Berhasil ✅</h1>
        <p className="text-center text-sm text-gray-600">
          Terima kasih telah melakukan konfirmasi pembayaran. Silakan unduh kwitansi di bawah ini.
        </p>

        <div className="text-center">
          <Button onClick={handleDownload} className="bg-green-600 text-white hover:bg-green-700">
            📄 Unduh Kwitansi
          </Button>
        </div>

        {/* KWITANSI */}
        <div ref={cetakRef} className="bg-white text-black p-6 border rounded space-y-4 text-sm leading-relaxed">
          <div className="flex justify-between items-center border-b pb-2 mb-2">
            <Image src="/desain-p3k.png" alt="Logo P3K" width={140} height={60} />
            <div className="text-right">
              <h2 className="font-bold text-lg text-green-800">KWITANSI PEMBAYARAN</h2>
              <p className="text-xs">Tanggal Cetak: {new Date().toLocaleString('id-ID')}</p>
            </div>
          </div>
          <p><strong>Kode Unit:</strong> {kode_unit}</p>
          <p><strong>Nama Sekolah:</strong> {nama_sekolah}</p>
          <p><strong>Nama Pengirim:</strong> {nama_pengirim}</p>
          <p><strong>WhatsApp:</strong> {whatsapp}</p>
          <p><strong>Kategori:</strong> {kategori}</p>

          <div className="mt-4 border-t pt-2">
            <h3 className="font-semibold mb-1">Rincian Biaya:</h3>
            <ul className="list-disc pl-5">
              {Object.entries(lombaDipilih).map(([id, jumlah]) => {
                const lomba = LOMBA_LIST.find((l) => l.id === id);
                if (!lomba) return null;
                return (
                  <li key={id}>
                    {lomba.nama} x {jumlah} tim = Rp {(jumlah * lomba.biaya).toLocaleString('id-ID')}
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 font-bold">
              Total Bayar: Rp {parseInt(totalBayar || '0').toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
