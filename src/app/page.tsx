'use client';


import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Info, FileText } from 'lucide-react';


const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

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
    <div
      className="relative font-montserrat min-h-screen bg-cover bg-center bg-fixed
                 bg-[url('/bg-mobile.png')] md:bg-[url('/bg-desktop.png')]"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 z-0" />

      {/* Content */}
      <div className="relative z-10 pt-28 px-4 md:px-20 pb-16 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="w-full md:w-1/2 text-white">
          <motion.h2
            className="text-xl md:text-2xl font-semibold mb-2 text-yellow-300 tracking-wider"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Selamat Datang di
          </motion.h2>

          <motion.h1
            className="text-5xl md:text-6xl font-extrabold leading-tight mb-4"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            P3K <span className="text-yellow-400">2025</span>
          </motion.h1>

          <motion.p
            className="text-md md:text-lg max-w-xl text-white/90 drop-shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            Pekan Perlombaan PMR (P3K) KSR PMI Unit Universitas Suryakancana
            tingkat Wira dan Madya Se-Wilayah Provinsi Jawa Barat.
            Yuk, tunjukkan semangat dan kemampuan tim kalian!
          </motion.p>

          {/* Tombol "Daftar Sekarang" */}
          <motion.a
            href="/daftar"
            className="mt-8 inline-block w-fit bg-yellow-400 text-black px-8 py-4 rounded-full text-lg font-semibold shadow-md hover:bg-yellow-300 transition"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Daftar Sekarang
          </motion.a>

          {/* Tombol Informasi - Responsive */}
        <motion.div
          className="mt-4 flex flex-col md:flex-row gap-4 py-5"
          initial="hidden"
          animate="show"
          variants={fadeInUp}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <Button
            asChild
            variant="outline"
            className="border-yellow-800 text-yellow-800 hover:bg-yellow-400 hover:text-black transition w-full md:w-auto"
          >
            <a href="/informasi" className="flex items-center gap-2">
              <Info className="w-4 h-4 md:mr-1" />
              <span className="md:inline">Informasi Lomba</span>
            </a>
          </Button>
        </motion.div>

          {/* Countdown */}
          <motion.div
            className="mt-12 p-4 bg-white/10 backdrop-blur-md rounded-xl shadow-lg text-center max-w-sm border border-yellow-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h3 className="text-sm font-semibold text-yellow-300 mb-3 tracking-widest">
              Menuju Hari-H
            </h3>
            <div className="grid grid-cols-4 gap-3 text-yellow-300 font-bold text-xl">
              {['Hari', 'Jam', 'Menit', 'Detik'].map((label, i) => {
                const value = [
                  timeLeft.days,
                  timeLeft.hours,
                  timeLeft.minutes,
                  timeLeft.seconds,
                ][i];
                return (
                  <div
                    key={label}
                    className="bg-black/80 p-2 rounded shadow-inner flex flex-col items-center animate-pulse"
                  >
                    {String(value).padStart(2, '0')}
                    <div className="text-xs text-yellow-400 mt-1">{label}</div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
