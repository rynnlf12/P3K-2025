'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const eventDate = new Date('2025-05-30T00:00:00');
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = eventDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((distance / (1000 * 60)) % 60),
          seconds: Math.floor((distance / 1000) % 60),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative font-montserrat min-h-screen bg-gradient-to-br from-yellow-200 via-orange-100 to-yellow-300 bg-cover bg-center">
      {/* Navbar */}
      <div className="w-full px-4 md:px-20 py-3 flex items-center justify-between bg-white/80 backdrop-blur-sm shadow-sm border-b border-orange-200 fixed top-0 left-0 z-50">
        <div className="flex items-center gap-3">
          <Image src="/desain-p3k.png" alt="Logo P3K" width={120} height={60} className="object-contain" />
        </div>

        <div className="hidden md:flex gap-6">
          <Link href="/daftar" className="relative text-orange-800 font-semibold hover:text-orange-600 transition before:absolute before:bottom-0 before:left-0 before:w-0 before:h-[2px] before:bg-orange-600 hover:before:w-full before:transition-all">
            Daftar
          </Link>
          <a
            href="https://drive.google.com/drive/folders/1HAsBXoPitXxJXpGss1smselXrWCHH5Jo?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="relative text-orange-800 font-semibold hover:text-orange-600 transition before:absolute before:bottom-0 before:left-0 before:w-0 before:h-[2px] before:bg-orange-600 hover:before:w-full before:transition-all"
          >
            Surat Edaran
          </a>
        </div>

        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden text-orange-800 focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex">
          <div className="w-64 bg-white h-full shadow-lg p-6 flex flex-col gap-4 pt-10">
            <button
              className="self-end mb-4 text-gray-700"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
            <Link
              href="/daftar"
              onClick={() => setSidebarOpen(false)}
              className="text-orange-700 font-semibold hover:text-orange-600 transition"
            >
              Daftar
            </Link>
            <a
              href="https://drive.google.com/drive/folders/1HAsBXoPitXxJXpGss1smselXrWCHH5Jo?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-700 font-semibold hover:text-orange-600 transition"
            >
              Surat Edaran
            </a>
          </div>
          <div className="flex-1" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Konten */}
      <div className="pt-28 px-4 md:px-20 pb-10 flex flex-col md:flex-row items-center justify-between">
        <div className="w-full md:w-1/2 text-center md:text-center z-10">
          <motion.h2
            className="text-xl md:text-2xl text-orange-900 font-bold drop-shadow-md mb-2"
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

          <motion.p
            className="text-orange-900 text-md md:text-lg mt-4 max-w-xl drop-shadow-sm"
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

          <motion.div
            className="mt-10 p-4 bg-black rounded-xl shadow-lg text-center max-w-sm border border-yellow-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h3 className="text-sm font-semibold text-yellow-300 mb-3">Menuju Hari-H</h3>
            <div className="grid grid-cols-4 gap-3 font-digital text-yellow-400 text-2xl">
              <div className="bg-gray-900 p-2 rounded shadow-inner animate-pulse">
                {String(timeLeft.days).padStart(2, '0')}
                <div className="text-[10px] text-yellow-400 mt-1">Hari</div>
              </div>
              <div className="bg-gray-900 p-2 rounded shadow-inner animate-pulse">
                {String(timeLeft.hours).padStart(2, '0')}
                <div className="text-[10px] text-yellow-400 mt-1">Jam</div>
              </div>
              <div className="bg-gray-900 p-2 rounded shadow-inner animate-pulse">
                {String(timeLeft.minutes).padStart(2, '0')}
                <div className="text-[10px] text-yellow-400 mt-1">Menit</div>
              </div>
              <div className="bg-gray-900 p-2 rounded shadow-inner animate-pulse">
                {String(timeLeft.seconds).padStart(2, '0')}
                <div className="text-[10px] text-yellow-400 mt-1">Detik</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
