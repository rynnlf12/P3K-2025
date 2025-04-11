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
    <div className="relative z-0 font-montserrat min-h-screen bg-gradient-to-br from-yellow-200 via-orange-100 to-yellow-300 bg-cover bg-center flex flex-col md:flex-row items-center justify-between px-4 md:px-20 py-10">
        {/* Sidebar Mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex">
            <div className="w-64 bg-white h-full shadow-lg p-6 flex flex-col gap-4 transition-all duration-300">
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
                href="https://drive.google.com/file/d/1sZtWkWkGlsuratEdaranContoh/view"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-700 font-semibold hover:text-orange-600 transition"
              >
                Surat Edaran
              </a>
            </div>
            {/* Klik luar sidebar menutup menu */}
            <div
              className="flex-1"
              onClick={() => setSidebarOpen(false)}
            />
          </div>
        )}

              
        {/* Navbar */}
        <div className="w-full px-4 md:px-20 py-4 flex items-center justify-between bg-transparent absolute top-0 left-0 z-50">

          {/* Desktop menu */}
          <div className="hidden md:flex gap-6">
            <Link
              href="/daftar"
              className="text-orange-800 font-semibold hover:text-orange-600 transition"
            >
              Daftar
            </Link>
            <a
              href="https://drive.google.com/drive/folders/1HAsBXoPitXxJXpGss1smselXrWCHH5Jo?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-800 font-semibold hover:text-orange-600 transition"
            >
              Surat Edaran
            </a>
          </div>

          {/* Hamburger button (mobile) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-orange-800 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

      {/* Logo pojok kanan atas */}
      <div className="absolute top-1 right-4 md:right-20 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Image
            src="/desain-p3k.png"
            alt="Logo P3K"
            width={150}
            height={80}
            className="object-contain"
          />
        </motion.div>
      </div>

      {/* Kiri: Teks Besar */}
      <div className="w-full md:w-1/2 text-center md:text-left mt-20 md:mt-0 z-10">
        <motion.h2
          className="text-xl md:text-2xl text-orange-900 font-bold drop-shadow-md mb-1"
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
          className="text-orange-900 text-md md:text-lg mt-4 max-w-xl drop-shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Pekan Perlombaan PMR (P3K) KSR PMI Unit Universitas Suryakancana tingkat Wira dan Madya Se-Wilayah Provinsi Jawa Barat
        </motion.p>

        {/* Tombol */}
        <motion.a
          href="/daftar"
          className="mt-10 inline-block w-full max-w-xs text-center bg-blue-600 text-white px-8 py-4 rounded-full text-lg shadow-md hover:bg-blue-700 transition"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Daftar Sekarang
        </motion.a>

        {/* Countdown Digital */}
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
  );
}
