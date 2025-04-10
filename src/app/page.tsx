'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Home() {
  const lombaDate = new Date('2025-06-01T08:00:00');
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = lombaDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((distance / (1000 * 60)) % 60),
          seconds: Math.floor((distance / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative font-montserrat min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-200 bg-cover bg-center flex flex-col md:flex-row items-center justify-between px-4 md:px-20 py-10"
    >
      {/* Logo pojok kiri atas */}
      <div className="absolute top-1 right-4 md:right-20 z-50">
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
          className="text-xl md:text-2xl text-orange-800 font-bold drop-shadow-md mb-1"
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
          <span className="text-yellow-500">P</span>
          <span className="text-yellow-500">3</span>
          <span className="text-yellow-500">K</span>
          <span className="text-orange-600 ml-3">2025</span>
        </motion.h1>

        <motion.p
          className="text-orange-900 text-md md:text-lg mt-4 max-w-xl drop-shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Pekan Perlombaan PMR (P3K) KSR PMI Unit Universitas Suryakancana tingkat Wira dan Madya Se-Wilayah Provinsi Jawa Barat
        </motion.p>

        <motion.div
          className="mt-8 p-4 bg-white/60 backdrop-blur-sm rounded-xl shadow text-center max-w-xs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h3 className="text-sm font-semibold text-orange-700 mb-1">Menuju Hari-H</h3>
          <div className="flex justify-between text-sm text-orange-900 font-bold">
            <div><span className="text-lg">{timeLeft.days}</span> hari</div>
            <div><span className="text-lg">{timeLeft.hours}</span> jam</div>
            <div><span className="text-lg">{timeLeft.minutes}</span> menit</div>
            <div><span className="text-lg">{timeLeft.seconds}</span> detik</div>
          </div>
        </motion.div>

        <motion.a
          href="/daftar"
          className="mt-10 inline-block w-full max-w-xs text-center bg-orange-600 text-white px-8 py-4 rounded-full text-lg shadow-md hover:bg-orange-700 transition"
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
