'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Home() {
  return (
    <div
      className="relative font-montserrat min-h-screen bg-cover bg-center flex flex-col md:flex-row items-center justify-between px-4 md:px-20 py-10"
      style={{ backgroundImage: `url('/bg-homepage.png')` }}
    >
      {/* Logo pojok kiri atas */}
      <div className="absolute top-1 left-4 md:left-20 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Image
            src="/desain-p3k.png"
            alt="Logo P3K"
            width={220}
            height={80}
            className="object-contain"
          />
        </motion.div>
      </div>

      {/* Kiri: Teks Besar */}
      <div className="w-full md:w-1/2 text-center md:text-left mt-20 md:mt-0">
        <motion.h2
          className="text-xl md:text-2xl text-white font-bold drop-shadow-md mb-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          SELAMAT DATANG DI
        </motion.h2>

        <motion.h1
          className="text-5xl md:text-6xl font-bold font-montserrat text-left leading-tight flex flex-wrap"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-yellow-400">P</span>
          <span className="text-yellow-400">3</span>
          <span className="text-yellow-400">K</span>
          <span className="text-orange-500 ml-3">2025</span>
        </motion.h1>

        {/* Deskripsi Acara */}
        <motion.p
          className="text-white text-md md:text-lg mt-4 max-w-xl drop-shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Pekan Perlombaan PMR (P3K) KSR PMI Unit Universitas Suryakancana tingkat Wira dan Madya Se-Wilayah Provinsi Jawa Barat
        </motion.p>

        <motion.a
          href="/daftar"
          className="mt-10 inline-block w-full max-w-xs text-center bg-blue-600 text-white px-8 py-4 rounded-full text-lg shadow-md hover:bg-blue-700 transition"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Daftar Sekarang
        </motion.a>
      </div>
    </div>
  );
}
