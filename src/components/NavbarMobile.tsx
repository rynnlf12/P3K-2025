'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Home, FileText, UserPlus, Trophy, Info } from 'lucide-react';

export default function NavbarMobile() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Daftar path admin yang harus menyembunyikan navbar
  const adminPaths = [
    '/admin/dashboard',
    '/admin/input-juara',
    '/admin/participants'
  ];

  // Cek apakah path saat ini termasuk dalam daftar adminPaths
  const isAdminPage = pathname && adminPaths.some(adminPath => 
    pathname.startsWith(adminPath)
  );

  if (isAdminPage) return null;

  const navItems = [
    { 
      href: '/', 
      label: 'Beranda',
      icon: <Home className="w-5 h-5" /> 
    },  
    {
      href: '/admin/leaderboard',
      label: 'Hasil Akhir Lomba',
      icon: <Trophy className="w-5 h-5" />
    },
    {
      href: '/informasi',
      label: 'Informasi Lomba',
      icon: <Info className="w-5 h-5" />
    },
    {
      href: 'https://drive.google.com/drive/folders/1HAsBXoPitXxJXpGss1smselXrWCHH5Jo?usp=sharing',
      label: 'Surat Edaran',
      external: true,
      icon: <FileText className="w-5 h-5" />
    },
    
  ];

  return (
    <nav className="md:hidden fixed top-0 left-0 w-full z-50">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-lg px-4 py-3 shadow-sm border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/desain-p3k.png" 
            alt="Logo P3K" 
            width={100} 
            height={40} 
            className="object-contain"
          />
        </Link>
        
        <button 
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Buka menu navigasi"
        >
          <svg 
            className="w-6 h-6 text-orange-600" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" 
            />
          </svg>
        </button>
      </div>

      {/* Overlay Menu */}
      <AnimatePresence>
        {open && (
          <>
            {/* Background Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={() => setOpen(false)}
            />

            {/* Slide-in Menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', ease: [0.4, 0, 0.2, 1] }}
              className="fixed top-0 right-0 h-full w-80 max-w-full bg-white/95 backdrop-blur-xl z-50 shadow-xl"
            >
              <div className="flex flex-col h-full p-6">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-8">
                  <Image 
                    src="/desain-p3k.png" 
                    alt="Logo P3K" 
                    width={120} 
                    height={50} 
                    className="object-contain opacity-90"
                  />
                  <button
                    onClick={() => setOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Tutup menu"
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 flex flex-col gap-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-4 p-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {item.icon}
                      <span className="text-lg font-medium">{item.label}</span>
                    </Link>
                  ))}
                </nav>

                {/* CTA Section */}
                <div className="border-t border-gray-100 pt-6 mt-6">
                  <Link
                    href="/daftar"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>Daftar Sekarang</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}