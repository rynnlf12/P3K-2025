'use client';

import { motion, useScroll } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Info, ChevronRight, Sunrise, Trophy } from 'lucide-react';
import Link from 'next/link';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const slideUp = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const {} = useScroll(); 

  useEffect(() => {
    setIsMounted(true);
    
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

  // Generate positions on client side only
  const particlePositions = isMounted 
    ? Array.from({ length: 12 }).map((_, i) => ({
        top: `${(i * 7) % 100}%`,
        left: `${(i * 10) % 100}%`,
        color: i % 3 === 0 ? 'rgba(245,158,11,0.3)' : 'rgba(185,28,28,0.3)'
      }))
    : [];

   useEffect(() => {
    setIsMounted(true);
  }, []);

return (
<div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-[#7A1F1F] to-[#3A1C1C]">
  {/* Animated Background Gradient */}
  {isMounted && (
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/30 via-[#FFA500]/30 to-[#B8860B]/30"
      animate={{
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
      }}
    />
  )}

  {/* Content Overlay */}
  <div className="relative z-10 container mx-auto px-4 md:px-8 py-28">
    <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
      {/* Left Content */}
      <div className="text-center lg:text-left max-w-2xl">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-6">
            <motion.span
              className="inline-block text-sm md:text-base font-bold bg-gradient-to-r from-[#FFD700] to-[#B8860B] bg-clip-text text-transparent mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Trophy className="inline-block w-5 h-5 mr-2 text-[#FFD700]" />
              MEMPEREBUTKAN PIALA GUBERNUR JAWA BARAT
            </motion.span>
          </div>

          <motion.h1
            className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6 drop-shadow-xl"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <span className="bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#B8860B] bg-clip-text text-transparent">
              P3K 2025
            </span>
          </motion.h1>
        </motion.div>

        <motion.p
          className="text-lg md:text-xl text-[#FFEBBE]/90 mb-8 max-w-xl mx-auto lg:mx-0 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          PEKAN PERLOMBAAN PMR KSR PMI UNIT UNIVERSITAS SURYAKANCANA (P3K) TINGKAT
          WIRA DAN MADYA SE-WILAYAH PROVINSI JAWA BARAT TAHUN 2025
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          <motion.div variants={slideUp}>
            <Button
              asChild
              className="group h-12 px-8 bg-gradient-to-r from-[#B8860B] to-[#FFD700] hover:from-[#FFD700] hover:to-[#B8860B] text-black font-bold rounded-xl transition-all shadow-lg shadow-amber-500/30"
            >
              <Link href="/daftar" className="flex items-center gap-2">
                Daftar Sekarang
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>

          <motion.div variants={slideUp}>
            <Button
              asChild
              variant="outline"
              className="h-12 px-8 border-[#FFD700]/50 text-yellow-700 hover:bg-[#FFD700]/10 hover:border-[#FFD700] hover:text-[#FFD700] rounded-xl backdrop-blur-sm font-semibold"
            >
              <Link href="/informasi" className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Informasi Lomba
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Countdown Timer */}
      <motion.div
        className="w-full max-w-md bg-gradient-to-br from-[#FFD700]/10 via-[#B8860B]/20 to-[#7A1F1F]/10 backdrop-blur-2xl rounded-2xl p-6 border border-[#FFD700]/30 shadow-2xl relative overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-center text-lg font-bold text-[#FFD700] mb-6">
          <Sunrise className="inline-block mr-2 w-5 h-5" />
          Countdown Pelaksanaan
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(timeLeft).map(([unit, value], index) => (
            <motion.div
              key={unit}
              className="p-4 bg-[#FFD700]/5 rounded-xl text-center border border-[#FFD700]/20 backdrop-blur-sm"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                delay: 0.8 + index * 0.1,
              }}
            >
              <div className="text-3xl font-extrabold bg-gradient-to-r from-[#FFD700] to-[#B8860B] bg-clip-text text-transparent mb-1">
                {String(value).padStart(2, '0')}
              </div>
              <div className="text-sm font-semibold text-[#FFD700]/80 uppercase tracking-wide">
                {unit}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-center text-[#FFD700]/70 mt-6 text-sm font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          ⏳ 30 Mei 2025 - Universitas Suryakancana
        </motion.p>
      </motion.div>
    </div>
  </div>

  {/* Animated Sun Rays */}
  {isMounted && (
    <motion.div
      className="absolute top-1/2 left-1/2 w-[200vw] h-[200vh] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/10 via-red-800/5 to-transparent pointer-events-none"
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 120,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{
        x: '-50%',
        y: '-50%',
      }}
    />
  )}

  {/* Floating Glitter Particles */}
  {isMounted && particlePositions.map((pos, i) => (
    <motion.div
      key={i}
      className="absolute w-2 h-2 mix-blend-screen"
      style={{
        backgroundColor: pos.color,
        top: pos.top,
        left: pos.left
      }}
      initial={{ y: 0, opacity: 0, scale: 1 }}
      animate={{
        y: [0, -40, 0],
        opacity: [0, 0.8, 0],
        scale: [1, 1.5, 1],
      }}
      transition={{
        duration: 4 + (i % 4),
        repeat: Infinity,
        delay: i * 0.2,
      }}
    />
  ))}
</div>
);
}