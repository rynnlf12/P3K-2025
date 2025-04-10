'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Home() {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Set tanggal lomba
  const targetDate = new Date('2025-05-30T00:00:00');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown({
        days: Math.max(0, days),
        hours: Math.max(0, hours),
        minutes: Math.max(0, minutes),
        seconds: Math.max(0, seconds),
      });

      if (distance < 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative font-montserrat min-h-screen bg-gradient-to-br from-yellow-100 via-orange-200 to-pink-200 bg-center bg-cover flex flex-col md:flex-row items-center justify-between px-4 md:px-20 py-10"
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

        {/* Countdown Card Style */}
        <motion.div
          className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          {[
            { label: 'Hari', value: countdown.days },
            { label: 'Jam', value: countdown.hours },
            { label: 'Menit', value: countdown.minutes },
            { label: 'Detik', value: countdown.seconds },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm shadow-md rounded-xl px-4 py-3"
            >
              <p className="text-3xl font-bold text-orange-700">{item.value}</p>
              <p className="text-sm font-medium text-gray-800">{item.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
