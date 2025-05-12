'use client';

import React, { useState, useEffect } from 'react';
import { LOMBA_LIST } from '@/data/lomba';
import { AnimatePresence, motion } from 'framer-motion';
import { AiOutlineWarning } from "react-icons/ai";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

const MotionCard = motion(Card);
const MotionButton = motion(Button);

export default function DaftarPage() {
  const [formSekolah, setFormSekolah] = useState({
    nama: '',
    pembina: '',
    whatsapp: '',
    kategori: '',
  });

  const [lombaDipilih, setLombaDipilih] = useState<Record<string, number>>({});
  const [peserta, setPeserta] = useState<Record<string, string[][]>>({});
  const [sekolahTerdaftar, setSekolahTerdaftar] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [namaSekolahError, setNamaSekolahError] = useState('');
  const [waError, setWaError] = useState('');
  const step = 1 + (Object.keys(lombaDipilih).length > 0 ? 1 : 0);
  
  useEffect(() => {
    const fetchSekolahTerdaftar = async () => {
      const { data, error } = await supabase
        .from('pendaftaran')
        .select('nama_sekolah');
      
      if (error) {
        console.error('Gagal ambil data:', error);
        return;
      }
      
      const daftar = data.map(row => normalisasiNamaSekolah(row.nama_sekolah || ''));
      setSekolahTerdaftar(daftar);
    };

    fetchSekolahTerdaftar();
  }, []);

  function normalisasiNamaSekolah(nama: string) {
    return nama
      .toLowerCase()
      .replace(/negeri/g, 'n')
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '');
  }

  const handleLombaChange = (id: string, jumlahTim: number) => {
    const lomba = LOMBA_LIST.find((l) => l.id === id);
    if (lomba && jumlahTim > 3) {
      setErrors([`Maksimal 3 tim per lomba ${lomba.nama}.`]);
      return;
    }

    setLombaDipilih((prev) => {
      const updated = { ...prev };
      if (jumlahTim <= 0) {
        delete updated[id];
      } else {
        updated[id] = jumlahTim;
      }
      return updated;
    });

    const jumlahPerTim = lomba?.maksPesertaPerTim || 1;

    setPeserta((prev) => {
      const updated = { ...prev };
      if (jumlahTim <= 0) {
        delete updated[id];
      } else {
        updated[id] = Array.from({ length: jumlahTim }, (_, i) =>
          Array.from({ length: jumlahPerTim }, (_, j) => prev[id]?.[i]?.[j] || '')
        );
      }
      return updated;
    });
  };

  const handlePesertaChange = (lombaId: string, timIndex: number, pesertaIndex: number, value: string) => {
    setPeserta((prev) => {
      const updated = { ...prev };
      updated[lombaId][timIndex][pesertaIndex] = value;
      return updated;
    });
  };

  const totalBayar = Object.entries(lombaDipilih).reduce((acc, [id, jumlah]) => {
    const lomba = LOMBA_LIST.find((l) => l.id === id);
    return lomba ? acc + lomba.biaya * jumlah : acc;
  }, 0);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');

  const handleLanjut = () => {
    setErrors([]);
    const formErrors: string[] = [];

    if (!formSekolah.nama || !formSekolah.pembina || !formSekolah.whatsapp || !formSekolah.kategori) {
      formErrors.push('Lengkapi data sekolah terlebih dahulu.');
    }

    if (sekolahTerdaftar.includes(normalisasiNamaSekolah(formSekolah.nama))) {
      formErrors.push('Sekolah ini sudah mendaftar.');
    }

    if (!/^08\d{8,}$/.test(formSekolah.whatsapp)) {
      formErrors.push('Format nomor WhatsApp tidak valid.');
    }

    const pesertaKosong: string[] = [];

    Object.entries(peserta).forEach(([lombaId, tims]) => {
      const lomba = LOMBA_LIST.find((l) => l.id === lombaId)!;
      tims.forEach((anggota, i) => {
        if (anggota.some((nama) => nama.trim() === '')) {
          pesertaKosong.push(`${lomba.nama} - Tim ${i + 1}`);
        }
      });
    });

    if (formErrors.length > 0) {
      setErrors(formErrors);
      return;
    }

    if (pesertaKosong.length > 0) {
      setConfirmMessage(`Beberapa tim belum lengkap:\n${pesertaKosong.join('\n')}\nTetap lanjut ke pembayaran?`);
      setShowConfirmModal(true);
      return;
    }

    lanjutKePembayaran();
  };

  const lanjutKePembayaran = () => {
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
    <div className="max-w-5xl mx-auto px-4 py-10 pt-28 space-y-8">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Langkah {step} dari 2</span>
          <span>{Math.round((step/2)*100)}% Terselesaikan</span>
        </div>
        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-yellow-600 to-red-600"
            initial={{ width: 0 }}
            animate={{ width: `${step * 50}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent">
          Formulir Pendaftaran P3K 2025
        </h1>
        <p className="text-gray-600">Isi data dengan lengkap dan benar</p>
      </div>

      {/* Form Sekolah */}
      <div className="space-y-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nama Sekolah</label>
            <input
              type="text"
              placeholder="Contoh: SMAN 1 Cianjur"
              value={formSekolah.nama}
              onChange={(e) => {
                const nama = e.target.value;
                setFormSekolah({ ...formSekolah, nama });
                const normalized = normalisasiNamaSekolah(nama);
                setNamaSekolahError(
                  sekolahTerdaftar.includes(normalized) 
                    ? 'Sekolah ini sudah terdaftar' 
                    : ''
                );
              }}
              className={`w-full px-4 py-2 rounded-lg border ${
                namaSekolahError ? 'border-red-500' : 'border-gray-200'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            {namaSekolahError && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AiOutlineWarning className="flex-shrink-0" /> {namaSekolahError}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nama Pembina</label>
              <input
                type="text"
                placeholder="Nama lengkap pembina"
                value={formSekolah.pembina}
                onChange={(e) => setFormSekolah({ ...formSekolah, pembina: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nomor WhatsApp</label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="08123456789"
                  value={formSekolah.whatsapp}
                  onChange={(e) => {
                    const wa = e.target.value.replace(/\D/g, '');
                    setFormSekolah({ ...formSekolah, whatsapp: wa });
                    setWaError(/^08\d{8,}$/.test(wa) ? '' : 'Format nomor tidak valid');
                  }}
                  className={`w-full pl-12 pr-4 py-2 rounded-lg border ${
                    waError ? 'border-red-500' : 'border-gray-200'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
              {waError && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AiOutlineWarning className="flex-shrink-0" /> {waError}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Kategori</label>
              <select
                value={formSekolah.kategori}
                onChange={(e) => setFormSekolah({ ...formSekolah, kategori: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Pilih Kategori</option>
                <option value="Wira">Wira</option>
                <option value="Madya">Madya</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Daftar Lomba */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LOMBA_LIST.map((lomba) => (
          <MotionCard
            key={lomba.id}
            whileHover={{ y: -2 }}
            className="border border-gray-200 rounded-xl overflow-hidden"
          >
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-yellow-100 to-red-50 p-4 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">{lomba.nama}</h3>
                  <span className="text-sm font-bold bg-red-200 text-red-800 px-2 py-1 rounded">
                    Rp {lomba.biaya.toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{lomba.keterangan}</p>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Jumlah Tim</span>
                  <div className="flex items-center gap-2">
                  <input
                      type="number"
                      min={0}
                      max={3}
                      value={lombaDipilih[lomba.id] || 0}
                      onChange={(e) => handleLombaChange(lomba.id, Math.min(3, parseInt(e.target.value) || 0))}
                      className="w-20 px-3 py-1 border border-gray-200 rounded text-center focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {peserta[lomba.id]?.map((tim, i) => (
                  <div key={i} className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Tim {i + 1}</span>
                      <span className="text-xs text-gray-500">
                        {tim.filter(Boolean).length}/{lomba.maksPesertaPerTim} anggota
                      </span>
                    </div>
                    
                    {tim.map((nama, j) => (
                      <input
                        key={j}
                        type="text"
                        placeholder={`Anggota ${j + 1}`}
                        value={nama}
                        onChange={(e) => handlePesertaChange(lomba.id, i, j, e.target.value)}
                        className={`w-full px-3 py-1 text-sm rounded border ${
                          !nama.trim() ? 'border-yellow-400' : 'border-gray-200'
                        } focus:ring-1 focus:ring-blue-500`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </MotionCard>
        ))}
      </div>

      {/* Ringkasan Pembayaran */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Pembayaran</h3>
        <div className="space-y-3">
          {Object.entries(lombaDipilih).map(([id, jumlah]) => {
            const lomba = LOMBA_LIST.find((l) => l.id === id);
            return lomba ? (
              <div key={id} className="flex justify-between text-sm">
                <span>{lomba.nama} (x{jumlah})</span>
                <span>Rp {(lomba.biaya * jumlah).toLocaleString('id-ID')}</span>
              </div>
            ) : null;
          })}
          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between font-semibold">
              <span>Total Pembayaran</span>
              <span className="bg-red-200 text-red-800 px-2 py-1 rounded">Rp {totalBayar.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            {errors.map((error, idx) => (
              <div key={idx} className="flex items-center gap-2 text-red-600">
                <AiOutlineWarning className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Konfirmasi Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl"
            >
              <div className="flex items-start gap-3">
                <AiOutlineWarning className="text-yellow-500 mt-1 w-6 h-6 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Perhatian</h3>
                  <p className="text-gray-600 mt-2 whitespace-pre-line">
                    {confirmMessage}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Kembali ke Form
                </Button>
                <Button
                  onClick={lanjutKePembayaran}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Lanjutkan Pembayaran
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tombol Aksi */}
      <div className="flex justify-center">
        <MotionButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLanjut}
          className="bg-gradient-to-r from-yellow-600 to-red-600 text-white px-8 py-3 rounded-lg font-semibold"
        >
          Lanjut ke Pembayaran
        </MotionButton>
      </div>
    </div>
  );
}