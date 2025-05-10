'use client';

import React, { useState, useEffect } from 'react';
import { LOMBA_LIST } from '@/data/lomba';
import { AnimatePresence, motion } from 'framer-motion';
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
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
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
    if (lomba && jumlahTim > 5) {
      setAlertMessage(`Maksimal 3 tim per lomba ${lomba.nama}.`);
      setShowAlert(true);
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

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!formSekolah.nama || !formSekolah.pembina || !formSekolah.whatsapp || !formSekolah.kategori) {
      newErrors.push('Lengkapi data sekolah terlebih dahulu.');
    }

    if (sekolahTerdaftar.includes(normalisasiNamaSekolah(formSekolah.nama))) {
      newErrors.push('Sekolah ini sudah mendaftar.');
    }

    if (waError) {
      newErrors.push('Perbaiki nomor WhatsApp terlebih dahulu.');
    }

    Object.entries(peserta).forEach(([lombaId, tims]) => {
      const { maksPesertaPerTim } = LOMBA_LIST.find((l) => l.id === lombaId)!;
      tims.forEach((anggota, i) => {
        if (anggota.some((nama) => nama.trim() === '')) {
          newErrors.push(`Semua nama peserta harus diisi untuk ${lombaId}, tim ${i + 1}.`);
        }
        if (anggota.length !== maksPesertaPerTim) {
          newErrors.push(`Jumlah anggota tim di ${lombaId} harus ${maksPesertaPerTim} orang.`);
        }
      });
    });

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
    <div className="max-w-5xl mx-auto px-4 py-10 pt-28 space-y-10">
         {/* Notifikasi Alert */}
      {showAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-96 bg-gradient-to-r from-yellow-400 to-red-500 text-white p-4 rounded-lg shadow-xl flex items-center justify-between space-x-4 transition-all ease-in-out duration-500 animate-pulse">
          <div className="flex items-center space-x-3">
          <svg
  xmlns="http://www.w3.org/2000/svg"
  className="w-6 h-6 text-white"
  fill="none"
  viewBox="0 0 24 24"
  stroke="currentColor"
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    d="M18.364 5.636a9 9 0 10-12.728 12.728 9 9 0 0012.728-12.728zM9 12h6M12 9v6"
  />
</svg>
            <span>{alertMessage}</span>
          </div>
          <button
            className="text-white bg-transparent hover:bg-white hover:text-red-600 rounded-full p-1"
            onClick={() => setShowAlert(false)}
          >
            ✕
          </button>
        </div>
      )}
      <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
        <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${step * 50}%` }}></div>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center text-red-700">Pendaftaran P3K 2025</h1>

      <div className="space-y-4 p-4 bg-red-50 rounded border border-red-200">
        <div>
          <input
            type="text"
            placeholder="Nama Sekolah"
            value={formSekolah.nama}
            onChange={(e) => {
              const nama = e.target.value;
              setFormSekolah({ ...formSekolah, nama });
              const normalized = normalisasiNamaSekolah(nama);
              if (sekolahTerdaftar.includes(normalized)) {
                setNamaSekolahError('Sekolah ini sudah mendaftar.');
              } else {
                setNamaSekolahError('');
              }
            }}
            className={`w-full border px-2 py-1 rounded ${
              namaSekolahError ? 'border-red-500' : formSekolah.nama ? 'border-green-500' : ''
            }`}
          />
          {namaSekolahError && <p className="text-sm text-red-600 mt-1">{namaSekolahError}</p>}
        </div>

        <input
          type="text"
          placeholder="Nama Pembina"
          value={formSekolah.pembina}
          onChange={(e) => setFormSekolah({ ...formSekolah, pembina: e.target.value })}
          className="w-full border px-2 py-1 rounded"
        />

        <div>
          <input
            type="text"
            placeholder="Nomor WhatsApp"
            value={formSekolah.whatsapp}
            onChange={(e) => {
              const wa = e.target.value.replace(/\D/g, '');
              setFormSekolah({ ...formSekolah, whatsapp: wa });
              if (!/^08\d{8,}$/.test(wa)) {
                setWaError('Nomor WhatsApp tidak valid (harus 08xxxxxxxxxx)');
              } else {
                setWaError('');
              }
            }}
            className={`w-full border px-2 py-1 rounded ${waError ? 'border-red-500' : formSekolah.whatsapp ? 'border-green-500' : ''}`}
          />
          {waError && <p className="text-sm text-red-600 mt-1">{waError}</p>}
        </div>

        <select
          value={formSekolah.kategori}
          onChange={(e) => setFormSekolah({ ...formSekolah, kategori: e.target.value })}
          className="w-full border px-2 py-1 rounded"
        >
          <option value="">Pilih Kategori</option>
          <option value="Wira">Wira</option>
          <option value="Madya">Madya</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {LOMBA_LIST.map((lomba) => (
          <MotionCard key={lomba.id} whileHover={{ scale: 1.02 }} className="border border-red-300">
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
    min={0}
    max={5}  // Membatasi jumlah tim maksimal 3
    className="w-16 px-2 py-1 border rounded text-sm"
    value={lombaDipilih[lomba.id] || 0}
    onChange={(e) => handleLombaChange(lomba.id, parseInt(e.target.value) || 0)}
  />
</div>

              {peserta[lomba.id]?.map((tim, i) => (
                <div key={i} className="bg-red-50 p-2 rounded border border-dashed space-y-1">
                  <p className="font-medium text-sm">Tim {i + 1}</p>
                  {tim.map((nama, j) => (
                    <input
                      key={j}
                      type="text"
                      placeholder={`Anggota ${j + 1}`}
                      className={`w-full border px-2 py-1 text-sm rounded ${!nama.trim() ? 'border-yellow-400' : ''}`}
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

      <div className="bg-red-50 p-4 rounded shadow-sm">
        <h3 className="text-xl font-semibold text-red-700 mb-2">Rincian Biaya</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          {Object.entries(lombaDipilih).map(([id, jumlah]) => {
            const lomba = LOMBA_LIST.find((l) => l.id === id);
            return lomba ? (
              <li key={id}>
                {lomba.nama} x {jumlah} tim = Rp {(lomba.biaya * jumlah).toLocaleString('id-ID')}
              </li>
            ) : null;
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