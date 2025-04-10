'use client';

import React, { useState } from 'react';
import { LOMBA_LIST } from '@/data/lomba';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const MotionCard = motion(Card);
const MotionButton = motion(Button);

export default function DaftarPage() {
  const [lombaDipilih, setLombaDipilih] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<string[]>([]);

  const handleLombaChange = (id: string, jumlah: number) => {
    setLombaDipilih((prev) => {
      const newState = { ...prev };
      if (jumlah === 0) delete newState[id];
      else newState[id] = jumlah;
      return newState;
    });
  };

  const totalBayar = Object.entries(lombaDipilih).reduce((acc, [id, jumlah]) => {
    const lomba = LOMBA_LIST.find((l) => l.id === id);
    if (!lomba) return acc;
    return acc + jumlah * lomba.biaya;
  }, 0);

  const validateForm = () => {
    const newErrors: string[] = [];
    if (Object.keys(lombaDipilih).length === 0) {
      newErrors.push('Pilih minimal satu lomba');
    }
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleLanjut = () => {
    if (validateForm()) {
      window.location.href = '/pembayaran';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-red-700">Pendaftaran Lomba PMR</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {LOMBA_LIST.map((lomba) => (
          <MotionCard
            key={lomba.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer border border-red-300 hover:shadow-md"
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-red-800">{lomba.nama}</h2>
                <span className="text-sm text-red-600">Rp {lomba.biaya.toLocaleString('id-ID')}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{lomba.keterangan}</p>
              <div className="flex items-center gap-2">
                <label htmlFor={`jumlah-${lomba.id}`} className="text-sm text-gray-700">
                  Jumlah Tim:
                </label>
                <input
                  type="number"
                  id={`jumlah-${lomba.id}`}
                  className="w-16 px-2 py-1 border rounded text-sm"
                  value={lombaDipilih[lomba.id] || 0}
                  onChange={(e) => handleLombaChange(lomba.id, parseInt(e.target.value) || 0)}
                  min={0}
                  max={3}
                />
              </div>
            </CardContent>
          </MotionCard>
        ))}
      </div>

      <div className="mt-8 bg-red-50 p-4 rounded shadow-sm">
        <h3 className="text-xl font-semibold text-red-700 mb-2">Rincian Biaya</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          {Object.entries(lombaDipilih).map(([id, jumlah]) => {
            const lomba = LOMBA_LIST.find((l) => l.id === id);
            if (!lomba) return null;
            return (
              <li key={id}>
                {lomba.nama} x {jumlah} tim = Rp {(lomba.biaya * jumlah).toLocaleString('id-ID')}
              </li>
            );
          })}
        </ul>
        <p className="font-bold mt-2">Total: Rp {totalBayar.toLocaleString('id-ID')}</p>
      </div>

      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded"
          >
            {errors.map((error, idx) => (
              <p key={idx}>⚠️ {error}</p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex justify-center">
        <MotionButton
          type="button"
          onClick={handleLanjut}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-red-600 text-white hover:bg-red-700 px-6 py-2 rounded"
        >
          Lanjut ke Pembayaran
        </MotionButton>
      </div>
    </div>
  );
}
