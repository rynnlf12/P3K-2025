// app/sukses/page.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export default function SuksesPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-100 px-6 text-center">
      <motion.div
        className="bg-white/70 p-8 rounded-xl border border-orange-300 shadow max-w-xl w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-orange-700 mb-2">Pendaftaran Berhasil!</h1>
        <p className="mb-4 text-gray-700">
          Terima kasih telah mendaftar. Data kamu telah berhasil dikirim dan akan segera kami proses.
        </p>
        <p className="mb-6 text-sm text-gray-600">
          Mohon tunggu konfirmasi dari panitia atau hubungi kami melalui WhatsApp untuk info lebih lanjut.
        </p>

        <Link
          href="/"
          className="inline-block bg-gradient-to-r from-orange-400 to-pink-500 text-white px-6 py-3 rounded-full hover:from-orange-500 hover:to-pink-600 transition"
        >
          Kembali ke Beranda
        </Link>
      </motion.div>
    </div>
  );
}
