'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Home() {
  return (
    <div
      className="relative font-montserrat min-h-screen bg-cover bg-center flex items-center justify-between px-8 md:px-20"
      style={{ backgroundImage: `url('/bg-homepage.png')` }}
    >
      {/* Logo pojok kiri atas */}
      <div className="absolute top-6 left-6 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Image
            src="/desain-p3k.png"
            alt="Logo P3K"
            width={160}
            height={80}
            className="object-contain"
          />
        </motion.div>
      </div>

      {/* Kiri: Teks Besar */}
      <div className="w-full md:w-1/2">
        <motion.h2
          className="text-xl md:text-2xl text-white drop-shadow-md mb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          SELAMAT DATANG DI
        </motion.h2>

        <motion.h1
          className="text-6xl font-bold font-montserrat text-left leading-tight flex flex-wrap"
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
          className="mt-10 inline-block bg-blue-600 text-white px-8 py-4 rounded-full text-lg shadow-md hover:bg-blue-700 transition"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Daftar Sekarang
        </motion.a>
      </div>

      {/* Floating Buttons */}
      <div className="fixed bottom-5 right-5 flex flex-col gap-3 z-50">
        {/* WhatsApp */}
        <a
          href="https://wa.me/6281234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full shadow-lg transition transform hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.52 3.48A11.78 11.78 0 0012 0a11.76 11.76 0 00-10.3 17.53L0 24l6.74-1.77A11.76 11.76 0 0012 24a11.77 11.77 0 008.36-20.52zM12 21.68a9.66 9.66 0 01-5.14-1.48l-.37-.22-4 1.05 1.06-3.88-.24-.4A9.65 9.65 0 1112 21.68zm5.44-7.26c-.3-.15-1.76-.87-2.03-.97s-.47-.15-.67.15-.77.96-.95 1.16-.35.22-.65.07a7.93 7.93 0 01-2.34-1.45 8.81 8.81 0 01-1.63-2 0.73 0.73 0 01.1-.78c.1-.11.23-.3.35-.45s.15-.26.23-.44a0.8 0.8 0 00-.04-.76c-.11-.15-.66-1.6-.9-2.2s-.47-.5-.67-.5h-.57a1.1 1.1 0 00-.8.37 3.34 3.34 0 00-1 2.44 5.82 5.82 0 001.2 3.1 13.21 13.21 0 005.18 4.87 6.36 6.36 0 003.82 1.1 3.34 3.34 0 002.22-.94 2.64 2.64 0 00.58-1.86c0-.28-.21-.42-.43-.52z" />
          </svg>
          <span>Chat Kami</span>
        </a>

        {/* Instagram */}
        <a
          href="https://instagram.com/p3k_event"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg transition transform hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 2 .3 2.5.5a5 5 0 011.7 1.1c.5.5.8 1 .9 1.6.2.6.4 1.4.5 2.6.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.3 2-.5 2.6a5 5 0 01-1.1 1.7c-.5.5-1 .8-1.6.9-.6.2-1.4.4-2.6.5-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-2-.3-2.6-.5a5 5 0 01-1.7-1.1c-.5-.5-.8-1-.9-1.6-.2-.6-.4-1.4-.5-2.6-.1-1.2-.1-1.6-.1-4.8s0-3.6.1-4.8c.1-1.2.3-2 .5-2.6a5 5 0 011.1-1.7c.5-.5 1-.8 1.6-.9.6-.2 1.4-.4 2.6-.5 1.2-.1 1.6-.1 4.8-.1m0-2.2C8.7 0 8.3 0 7.1.1c-1.3.1-2.2.3-3 .6a7.2 7.2 0 00-2.6 1.7A7.2 7.2 0 00.2 5a10 10 0 00-.6 3C-.1 9.3 0 9.7 0 12s0 2.7.1 3.9c.1 1.3.3 2.2.6 3a7.2 7.2 0 001.7 2.6 7.2 7.2 0 002.6 1.7c.8.3 1.7.5 3 .6 1.2.1 1.6.1 4.9.1s3.7 0 4.9-.1c1.3-.1 2.2-.3 3-.6a7.2 7.2 0 002.6-1.7 7.2 7.2 0 001.7-2.6c.3-.8.5-1.7.6-3 .1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.1-1.3-.3-2.2-.6-3a7.2 7.2 0 00-1.7-2.6A7.2 7.2 0 0019 0c-.8-.3-1.7-.5-3-.6C15.7-.1 15.3 0 12 0z" />
            <circle cx="12" cy="12" r="3.5" />
            <circle cx="18.5" cy="5.5" r="1.5" />
          </svg>
          <span>Chat Kami</span>
        </a>
      </div>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="relative font-montserrat min-h-screen bg-cover bg-center flex items-center justify-between px-8 md:px-20"
      style={{ backgroundImage: `url('/bg-homepage.png')` }}
    >
      {/* Kiri: Teks Besar */}
      <div className="w-full md:w-1/2">
        <motion.h2
          className="text-xl md:text-2xl text-white drop-shadow-md"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          SELAMAT DATANG DI
        </motion.h2>

        <motion.h1
          className="text-6xl font-bold font-montserrat text-left leading-tight flex flex-wrap"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-yellow-400">P</span>
          <span className="text-yellow-400">3</span>
          <span className="text-yellow-400">K</span>
          <span className="text-orange-500">2025</span>
        </motion.h1>

        <motion.a
          href="/daftar"
          className="mt-10 inline-block bg-blue-600 text-white px-8 py-4 rounded-full text-lg shadow-md hover:bg-blue-700 transition"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Daftar Sekarang
        </motion.a>
      </div>

      {/* Kanan: Logo */}
      <div className="absolute top-10 left-30 z-10">
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6 }}
  >
    <Image
      src="/desain-p3k.png"
      alt="Logo P3K"
      width={200}
      height={80}
      className="object-contain"
    />
  </motion.div>
</div>


      {/* Floating Buttons */}
      <div className="fixed bottom-5 right-5 flex flex-col gap-3 z-50">
        {/* WhatsApp */}
        <a
          href="https://wa.me/6281234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full shadow-lg transition transform hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.52 3.48A11.78 11.78 0 0012 0a11.76 11.76 0 00-10.3 17.53L0 24l6.74-1.77A11.76 11.76 0 0012 24a11.77 11.77 0 008.36-20.52zM12 21.68a9.66 9.66 0 01-5.14-1.48l-.37-.22-4 1.05 1.06-3.88-.24-.4A9.65 9.65 0 1112 21.68zm5.44-7.26c-.3-.15-1.76-.87-2.03-.97s-.47-.15-.67.15-.77.96-.95 1.16-.35.22-.65.07a7.93 7.93 0 01-2.34-1.45 8.81 8.81 0 01-1.63-2 0.73 0.73 0 01.1-.78c.1-.11.23-.3.35-.45s.15-.26.23-.44a0.8 0.8 0 00-.04-.76c-.11-.15-.66-1.6-.9-2.2s-.47-.5-.67-.5h-.57a1.1 1.1 0 00-.8.37 3.34 3.34 0 00-1 2.44 5.82 5.82 0 001.2 3.1 13.21 13.21 0 005.18 4.87 6.36 6.36 0 003.82 1.1 3.34 3.34 0 002.22-.94 2.64 2.64 0 00.58-1.86c0-.28-.21-.42-.43-.52z" />
          </svg>
          <span>Chat Kami</span>
        </a>

        {/* Instagram */}
        <a
          href="https://instagram.com/p3k_event"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg transition transform hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 2 .3 2.5.5a5 5 0 011.7 1.1c.5.5.8 1 .9 1.6.2.6.4 1.4.5 2.6.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.3 2-.5 2.6a5 5 0 01-1.1 1.7c-.5.5-1 .8-1.6.9-.6.2-1.4.4-2.6.5-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-2-.3-2.6-.5a5 5 0 01-1.7-1.1c-.5-.5-.8-1-.9-1.6-.2-.6-.4-1.4-.5-2.6-.1-1.2-.1-1.6-.1-4.8s0-3.6.1-4.8c.1-1.2.3-2 .5-2.6a5 5 0 011.1-1.7c.5-.5 1-.8 1.6-.9.6-.2 1.4-.4 2.6-.5 1.2-.1 1.6-.1 4.8-.1m0-2.2C8.7 0 8.3 0 7.1.1c-1.3.1-2.2.3-3 .6a7.2 7.2 0 00-2.6 1.7A7.2 7.2 0 00.2 5a10 10 0 00-.6 3C-.1 9.3 0 9.7 0 12s0 2.7.1 3.9c.1 1.3.3 2.2.6 3a7.2 7.2 0 001.7 2.6 7.2 7.2 0 002.6 1.7c.8.3 1.7.5 3 .6 1.2.1 1.6.1 4.9.1s3.7 0 4.9-.1c1.3-.1 2.2-.3 3-.6a7.2 7.2 0 002.6-1.7 7.2 7.2 0 001.7-2.6c.3-.8.5-1.7.6-3 .1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.1-1.3-.3-2.2-.6-3a7.2 7.2 0 00-1.7-2.6A7.2 7.2 0 0019 0c-.8-.3-1.7-.5-3-.6C15.7-.1 15.3 0 12 0z" />
            <circle cx="12" cy="12" r="3.5" />
            <circle cx="18.5" cy="5.5" r="1.5" />
          </svg>
          <span>Chat Kami</span>
        </a>
      </div>
    </div>
  );
}

