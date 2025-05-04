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
      className="hidden md:flex w-full items-center justify-between px-10 py-1 fixed top-0 left-0 z-50 bg-white text-white font-bold tracking-wide"
    >
      {/* Logo */}
      <Link href="/">
        <Image
          src="/desain-p3k.png"
          alt="Logo P3K"
          width={150}
          height={0}
          className="object-contain h-auto"
        />
      </Link>

      {/* Menu */}
      <div className="flex gap-6 uppercase text-md">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`hover:bg-white hover:text-pink-600 transition duration-300 ${
              pathname === item.href ? 'text-yellow-700' : 'text-yellow-700/90'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* CTA Button */}
      <Link
        href="/daftar"
        className="border-3 border-yellow-700 px-4 py-1 text-md uppercase tracking-widest text-yellow-700 hover:bg-white hover:text-pink-600 transition duration-300"
      >
        DAFTAR SEKARANG
      </Link>
    </motion.nav>
  );
}
