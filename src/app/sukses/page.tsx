'use client';

import dynamic from 'next/dynamic';

// Dynamic import untuk mencegah error saat build karena html2canvas tidak support SSR
const SuksesContent = dynamic(() => import('./SuksesContent'), {
  ssr: false,
  loading: () => <p className="text-center mt-20 text-orange-600">Memuat halaman sukses...</p>,
});

export default function Page() {
  return <SuksesContent />;
}
