'use client';

import React, { useState } from 'react';
import { LOMBA_LIST } from '@/data/lomba';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const MotionCard = motion(Card);
const MotionButton = motion(Button);

// Konfigurasi jumlah peserta per tim berdasarkan lomba
const ANGGOTA_PER_TIM: Record<string, { min: number; max?: number }> = {
  'tandu-putra': { min: 2 },
  'tandu-putri': { min: 2 },
  'pertolongan-pertama': { min: 4 },
  'mojang-jajaka': { min: 2 },
  'poster': { min: 3 },
  'senam-poco-poco': { min: 8, max: 10 },
};

export default function DaftarPage() {
  const [formSekolah, setFormSekolah] = useState({
    nama: '',
    pembina: '',
    whatsapp: '',
    kategori: '',
  });
  const [lombaDipilih, setLombaDipilih] = useState<Record<string, number>>({});
  const [peserta, setPeserta] = useState<Record<string, string[][]>>({});
  const [errors, setErrors] = useState<string[]>([]);

  const handleLombaChange = (id: string, jumlah: number) => {
    setLombaDipilih((prev) => {
      const newState = { ...prev };
      if (jumlah === 0) delete newState[id];
      else newState[id] = jumlah;
      return newState;
    });

    setPeserta((prev) => {
      const updated = { ...prev };
      if (jumlah === 0) {
        delete updated[id];
      } else {
        const anggota = ANGGOTA_PER_TIM[id]?.min || 1;
        updated[id] = Array.from({ length: jumlah }, (_, teamIdx) => {
          const current = prev[id]?.[teamIdx] || [];
          return Array.from({ length: anggota }, (_, memberIdx) => current[memberIdx] || '');
        });
      }
      return updated;
    });
  };

  const handlePesertaChange = (
    lombaId: string,
    timIndex: number,
    anggotaIndex: number,
    value: string
  ) => {
    setPeserta((prev) => {
      const updated = { ...prev };
      if (!updated[lombaId]) updated[lombaId] = [];
      if (!updated[lombaId][timIndex]) updated[lombaId][timIndex] = [];
      updated[lombaId][timIndex][anggotaIndex] = value;
      return updated;
    });
  };

  const totalBayar = Object.entries(lombaDipilih).reduce((acc, [id, jumlah]) => {
    const lomba = LOMBA_LIST.find((l) => l.id === id);
    return lomba ? acc + jumlah * lomba.biaya : acc;
  }, 0);

  const validateForm = () => {
    const newErrors: string[] = [];
    if (!formSekolah.nama || !formSekolah.pembina || !formSekolah.whatsapp || !formSekolah.kategori) {
      newErrors.push('Isi semua data sekolah terlebih dahulu.');
    }
    if (Object.keys(lombaDipilih).length === 0) {
      newErrors.push('Pilih minimal satu lomba.');
    }
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleLanjut = () => {
    if (!validateForm()) return;

    const data = {
      sekolah: formSekolah,
      lombaDipilih,
      peserta,
      totalBayar,
    };

    localStorage.setItem('formPendaftaran', JSON.stringify(data));
    window.location.href = '/pembayaran';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-red-700">Pendaftaran Lomba PMR</h1>

      {/* Form Sekolah */}
      <div className="space-y-4 p-4 bg-red-50 rounded border border-red-200">
        <input type="text" placeholder="Nama Sekolah" value={formSekolah.nama} onChange={(e) => setFormSekolah({ ...formSekolah, nama: e.target.value })} className="w-full border px-2 py-1 rounded" />
        <input type="text" placeholder="Nama Pembina" value={formSekolah.pembina} onChange={(e) => setFormSekolah({ ...formSekolah, pembina: e.target.value })} className="w-full border px-2 py-1 rounded" />
        <input type="text" placeholder="Nomor WhatsApp" value={formSekolah.whatsapp} onChange={(e) => setFormSekolah({ ...formSekolah, whatsapp: e.target.value })} className="w-full border px-2 py-1 rounded" />
        <select value={formSekolah.kategori} onChange={(e) => setFormSekolah({ ...formSekolah, kategori: e.target.value })} className="w-full border px-2 py-1 rounded">
          <option value="">Pilih Kategori</option>
          <option value="Wira">Wira</option>
          <option value="Madya">Madya</option>
        </select>
      </div>

      {/* Pilihan Lomba */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {LOMBA_LIST.map((lomba) => (
          <MotionCard key={lomba.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="cursor-pointer border border-red-300 hover:shadow-md">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-red-800">{lomba.nama}</h2>
                <span className="text-sm text-red-600">Rp {lomba.biaya.toLocaleString('id-ID')}</span>
              </div>
              <p className="text-sm text-gray-600">{lomba.keterangan}</p>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Jumlah Tim:</label>
                <input
                  type="number"
                  className="w-16 px-2 py-1 border rounded text-sm"
                  value={lombaDipilih[lomba.id] || 0}
                  onChange={(e) => handleLombaChange(lomba.id, parseInt(e.target.value) || 0)}
                  min={0}
                  max={3}
                />
              </div>

              {/* Input Peserta Per Tim */}
              {peserta[lomba.id]?.map((tim, i) => (
                <div key={i} className="bg-red-50 p-2 rounded border border-dashed space-y-1">
                  <p className="font-medium text-sm">Tim {i + 1}</p>
                  {tim.map((nama, j) => (
                    <input
                      key={j}
                      type="text"
                      placeholder={`Anggota ${j + 1}`}
                      className="w-full border px-2 py-1 text-sm rounded"
                      value={nama}
                      onChange={(e) => handlePesertaChange(lomba.id, i, j, e.target.value)}
                    />
                  ))}
                </div>
              ))}
            </CardContent>
          </MotionCard>
        ))}
      </div>

      {/* Rincian Biaya */}
      <div className="bg-red-50 p-4 rounded shadow-sm">
        <h3 className="text-xl font-semibold text-red-700 mb-2">Rincian Biaya</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          {Object.entries(lombaDipilih).map(([id, jumlah]) => {
            const lomba = LOMBA_LIST.find((l) => l.id === id);
            if (!lomba) return null;
            return <li key={id}>{lomba.nama} x {jumlah} tim = Rp {(lomba.biaya * jumlah).toLocaleString('id-ID')}</li>;
          })}
        </ul>
        <p className="font-bold mt-2">Total: Rp {totalBayar.toLocaleString('id-ID')}</p>
      </div>

      {/* Error */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            {errors.map((error, idx) => <p key={idx}>⚠️ {error}</p>)}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex justify-center">
        <MotionButton type="button" onClick={handleLanjut} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-red-600 text-white hover:bg-red-700 px-6 py-2 rounded">
          Lanjut ke Pembayaran
        </MotionButton>
      </div>
    </div>
  );
}
