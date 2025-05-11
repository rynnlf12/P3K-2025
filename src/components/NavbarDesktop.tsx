'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function NavbarDesktop() {
  const pathname = usePathname();

  // Pastikan pathname tidak null sebelum melanjutkan
  if (!pathname || pathname.includes('/admin')) {
    return null; // Jangan tampilkan navbar jika berada di halaman admin atau pathname null
  }

  const navItems = [
    { label: 'BERANDA', href: '/' },
    {
      href: 'https://drive.google.com/drive/folders/1HAsBXoPitXxJXpGss1smselXrWCHH5Jo?usp=sharing',
      label: 'SURAT EDARAN',
      external: true,
    },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 w-full z-50 bg-white shadow-md text-black px-4 sm:px-8 py-3 flex justify-between items-center"
    >
      {/* Logo */}
      <Link href="/" className="flex items-center">
        <Image
          src="/desain-p3k.png"
          alt="Logo P3K"
          width={120}
          height={40}
          className="object-contain"
        />
      </Link>

      {/* Menu */}
      <div className="hidden sm:flex space-x-6 text-sm font-semibold uppercase text-gray-700">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            target={item.external ? '_blank' : '_self'}
            className={`hover:text-pink-600 transition-colors duration-300 ${
              pathname === item.href ? 'text-yellow-600' : 'text-gray-700'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* CTA Button */}
      <Link
        href="/daftar"
        className="hidden sm:inline-block px-6 py-2 text-sm font-semibold uppercase tracking-widest text-yellow-700 border-2 border-yellow-700 rounded-md hover:bg-yellow-700 hover:text-white transition-colors duration-300"
      >
        DAFTAR SEKARANG
      </Link>
    </motion.nav>
  );
}
