'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, ExternalLink } from 'lucide-react'; // Impor ikon

export default function NavbarDesktop() {
  const pathname = usePathname();

  // Daftar path admin yang harus menyembunyikan navbar
  const adminPaths = [
    '/admin/dashboard',
    '/admin/input-juara',
    '/admin/participants',
    '/admin/daftar-ulang',
    // Tambahkan path admin lain jika ada
  ];

  // Cek apakah path saat ini termasuk dalam daftar adminPaths
  const isAdminPage = pathname && adminPaths.some(adminPath => 
    pathname.startsWith(adminPath)
  );

  // Jangan render navbar jika ini adalah halaman admin
  if (isAdminPage) return null;

  const navItems = [
    { label: 'BERANDA', href: '/' },
    { label: 'INFORMASI LOMBA', href: '/informasi' },
    { label: 'HASIL AKHIR', href: '/admin/leaderboard' },
    {
      label: 'SURAT EDARAN',
      href: 'https://drive.google.com/drive/folders/1HAsBXoPitXxJXpGss1smselXrWCHH5Jo?usp=sharing',
      external: true,
    },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      // Styling navbar: Fixed, glassmorphism, shadow halus
      className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-md shadow-sm border-b border-gray-100/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20"> {/* Tinggi navbar sedikit ditambah */}

          {/* Logo Section */}
          <Link href="/" className="flex-shrink-0">
            <motion.div 
              className="flex items-center space-x-2 group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Image
                src="/desain-p3k.png" // Pastikan path logo benar
                alt="Logo P3K"
                width={150} // Sedikit lebih besar
                height={55}
                className="object-contain transition-all duration-300 group-hover:opacity-90"
                priority // Penting untuk LCP (Largest Contentful Paint)
              />
            </motion.div>
          </Link>

          {/* Navigation Items Section */}
          <div className="hidden md:flex items-center space-x-10"> {/* Spasi antar item ditambah */}
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  target={item.external ? '_blank' : '_self'}
                  rel={item.external ? 'noopener noreferrer' : ''}
                  className={`relative group text-sm font-medium tracking-wide transition-colors duration-200 ease-in-out
                    ${
                      isActive 
                        ? 'text-gray-900' 
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                >
                  <div className="flex items-center gap-1.5 py-2"> {/* Wrapper untuk ikon & teks */}
                    <span>{item.label}</span>
                    {item.external && <ExternalLink className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600" />}
                  </div>

                  {/* Underline untuk item aktif */}
                  {isActive ? (
                    <motion.div
                      className="absolute -bottom-0.5 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                      layoutId="navbar-underline" // Penting untuk animasi antar halaman
                      transition={{ type: 'spring', bounce: 0.25, duration: 0.6 }}
                    />
                  ) : (
                    // Underline untuk hover pada item tidak aktif
                    <div className="absolute -bottom-0.5 left-0 right-0 h-1 bg-amber-500 rounded-full 
                                 scale-x-0 group-hover:scale-x-100 transition-transform 
                                 duration-300 ease-out origin-center" 
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* CTA Button Section */}
          <Link href="/daftar" passHref>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(245, 158, 11, 0.3)" }} // Efek shadow saat hover
              whileTap={{ scale: 0.98 }}
              className="group flex items-center gap-2 px-6 py-3 rounded-full 
                       bg-gradient-to-r from-amber-500 to-orange-500 
                       text-white text-sm font-bold shadow-lg shadow-amber-500/25 
                       transition-all duration-300 ease-in-out
                       hover:from-amber-600 hover:to-orange-600" // Gradient lebih kaya & hover
            >
              DAFTAR SEKARANG
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.button>
          </Link>

        </div>
      </div>
    </motion.nav>
  );
}