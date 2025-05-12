'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function NavbarDesktop() {
  const pathname = usePathname();

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
    { label: 'BERANDA', href: '/' },
    { label: 'HASIL AKHIR', href: '/admin/leaderboard' },
    {
      label: 'SURAT EDARAN',
      href: 'https://drive.google.com/drive/folders/1HAsBXoPitXxJXpGss1smselXrWCHH5Jo?usp=sharing',
      external: true,
    },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo dengan efek gradient */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 group"
          >
            <Image
              src="/desain-p3k.png"
              alt="Logo P3K"
              width={140}
              height={50}
              className="object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                target={item.external ? '_blank' : '_self'}
                className={`relative px-1 text-sm font-medium transition-colors
                  ${
                    pathname === item.href 
                      ? 'text-gray-900 font-semibold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                {item.label}
                {pathname === item.href && (
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600"
                    layoutId="navbar-underline"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* CTA Button Modern */}
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link
              href="/daftar"
              className="flex items-center px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 
                text-white text-sm font-semibold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30
                transition-all duration-300"
            >
              <span className="mr-2">🚀</span>
              DAFTAR SEKARANG
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
}