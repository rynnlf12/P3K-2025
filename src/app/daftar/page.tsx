'use client';

import React, { useState } from 'react';
import { LOMBA_LIST } from '@/data/lomba';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const MotionCard = motion(Card);
const MotionButton = motion(Button);

export default function DaftarPage() {
  const [formSekolah, setFormSekolah] = useState({
    nama: '',
    pembina: '',
    whatsapp: '',
    kategori: '',
  });
  const [lombaDipilih, setLombaDipilih] = useState<Record<string, boolean>>({});
  const [peserta, setPeserta] = useState<Record<string, string[]>>({});
  const [errors, setErrors] = useState<string[]>([]);

  const toggleLomba = (id: string) => {
    setLombaDipilih((prev) => {
      const newState = { ...prev };
      if (newState[id]) {
        delete newState[id];
        const p = { ...peserta };
        delete p[id];
        setPeserta(p);
      } else {
        newState[id] = true;
      }
      return newState;
    });
  };

  const handlePesertaChange = (lombaId: string, index: number, value: string) => {
    setPeserta((prev) => {
      const updated = { ...prev };
      const list = updated[lombaId] || [];
      list[index] = value;
      updated[lombaId] = list;
      return updated;
    });
  };

  const tambahPeserta = (lombaId: string) => {
    setPeserta((prev) => ({
      ...prev,
      [lombaId]: [...(prev[lombaId] || []), ''],
    }));
  };

  const hapusPeserta = (lombaId: string, index: number) => {
    setPeserta((prev) => {
      const list = [...(prev[lombaId] || [])];
      list.splice(index, 1);
      return { ...prev, [lombaId]: list };
    });
  };

  const totalBayar = Object.keys(lombaDipilih).reduce((acc, id) => {
    const lomba = LOMBA_LIST.find((l) => l.id === id);
    return lomba ? acc + lomba.biaya : acc;
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
              <label className="inline-flex items-center gap-2 mt-2">
                <input type="checkbox" checked={!!lombaDipilih[lomba.id]} onChange={() => toggleLomba(lomba.id)} />
                <span className="text-sm">Ikut lomba ini</span>
              </label>

              {lombaDipilih[lomba.id] && (
                <div className="mt-2 space-y-2">
                  {(peserta[lomba.id] || []).map((nama, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder={`Peserta ${i + 1}`}
                        value={nama}
                        onChange={(e) => handlePesertaChange(lomba.id, i, e.target.value)}
                        className="w-full border px-2 py-1 text-sm rounded"
                      />
                      <button type="button" onClick={() => hapusPeserta(lomba.id, i)} className="text-red-500 text-sm">Hapus</button>
                    </div>
                  ))}
                  <Button type="button" onClick={() => tambahPeserta(lomba.id)} size="sm" variant="outline">+ Tambah Peserta</Button>
                </div>
              )}
            </CardContent>
          </MotionCard>
        ))}
      </div>

      {/* Rincian Biaya */}
      <div className="bg-red-50 p-4 rounded shadow-sm">
        <h3 className="text-xl font-semibold text-red-700 mb-2">Rincian Biaya</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          {Object.keys(lombaDipilih).map((id) => {
            const lomba = LOMBA_LIST.find((l) => l.id === id);
            if (!lomba) return null;
            return (
              <li key={id}>
                {lomba.nama} = Rp {lomba.biaya.toLocaleString('id-ID')}
              </li>
            );
          })}
        </ul>
        <p className="font-bold mt-2">Total: Rp {totalBayar.toLocaleString('id-ID')}</p>
      </div>

      {/* Error Message */}
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
