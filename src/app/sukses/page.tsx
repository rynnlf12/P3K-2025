// app/sukses/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

type FormData = {
  sekolah: {
    nama: string;
    pembina: string;
    whatsapp: string;
    kategori: string;
  };
  lombaDipilih: Record<string, number>;
  peserta: Record<string, string[][]>;
  totalBayar: number;
  buktiNamaFile?: string;
};

export default function SuksesPage() {
  const [formData, setFormData] = useState<FormData | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('formPendaftaran');
    if (saved) {
      setFormData(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-100 px-6 text-center">
      <motion.div
        className="bg-white/70 p-8 rounded-xl border border-orange-300 shadow max-w-2xl w-full text-left"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-orange-700 mb-2">Pendaftaran Berhasil!</h1>
          <p className="mb-4 text-gray-700">
            Terima kasih telah mendaftar. Data kamu telah berhasil disimpan dan akan segera kami proses.
          </p>
        </div>

        {formData && (
          <div className="mt-6 text-sm space-y-2 text-gray-800">
            <p><strong>Nama Sekolah:</strong> {formData.sekolah.nama}</p>
            <p><strong>Nama Pembina:</strong> {formData.sekolah.pembina}</p>
            <p><strong>WhatsApp:</strong> {formData.sekolah.whatsapp}</p>
            <p><strong>Kategori:</strong> {formData.sekolah.kategori}</p>
            <p><strong>Total Biaya:</strong> Rp {formData.totalBayar.toLocaleString('id-ID')}</p>

            <div className="mt-4">
              <p className="font-semibold text-orange-600">Lomba & Jumlah Tim:</p>
              <ul className="list-disc list-inside">
                {Object.entries(formData.lombaDipilih).map(([id, jumlah]) => (
                  <li key={id}>{id} – {jumlah} tim</li>
                ))}
              </ul>
            </div>

            {formData.buktiNamaFile && (
              <p className="mt-2"><strong>Bukti Upload:</strong> {formData.buktiNamaFile}</p>
            )}
          </div>
        )}

        <p className="mt-6 text-sm text-gray-600">
          Silakan tunggu konfirmasi lebih lanjut atau hubungi panitia melalui WhatsApp.
        </p>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-orange-400 to-pink-500 text-white px-6 py-3 rounded-full hover:from-orange-500 hover:to-pink-600 transition"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
