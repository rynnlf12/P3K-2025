'use client';
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import SuksesContent from './SuksesContent';

export default function SuksesPage() {
  return (
    <Suspense fallback={<p className="p-6">Memuat data...</p>}>
      <SuksesContent />
    </Suspense>
  );
}
