'use client';
import { Suspense } from 'react';
import SuksesContent from './SuksesContent';

export default function Page() {
  return (
    <Suspense fallback={<div>Memuat...</div>}>
      <SuksesContent />
    </Suspense>
  );
}
