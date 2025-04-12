'use client';

import dynamic from 'next/dynamic';

// Import komponen utama secara dinamis agar hanya dirender di sisi client
const SuksesContent = dynamic(() => import('./SuksesContent'), {
  ssr: false,
  loading: () => <div className="text-center py-32 text-orange-600">Memuat halaman...</div>,
});

export default function Page() {
  return <SuksesContent />;
}
