// app/daftar/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Sun, Mountain, CloudSun } from 'lucide-react';
import Image from 'next/image';


const LOMBA_LIST = [
  { id: 'tandu_putra', name: 'Lomba Tandu Darurat Putra', biaya: 70000, orangPerTim: 2 },
  { id: 'tandu_putri', name: 'Lomba Tandu Darurat Putri', biaya: 70000, orangPerTim: 2 },
  { id: 'pertolongan_pertama', name: 'Lomba Pertolongan Pertama', biaya: 75000, orangPerTim: 4 },
  { id: 'mojang_jajaka', name: 'Lomba Mojang Jajaka', biaya: 70000, orangPerTim: 2 },
  { id: 'senam_poco', name: 'Lomba Senam Kreasi Poco-Poco', biaya: 75000, orangPerTim: 10 },
  { id: 'poster', name: 'Lomba Poster', biaya: 60000, orangPerTim: 3 },
];

export default function PendaftaranPage() {
  const router = useRouter();
  const MotionButton = motion(Button);
  const [sekolah, setSekolah] = useState({ nama: '', pembina: '', whatsapp: '', kategori: 'wira' });
  const [lombaDipilih, setLombaDipilih] = useState({});
  const [errors, setErrors] = useState([]);

  const handleLombaChange = (id, jumlah) => {
    setLombaDipilih((prev) => {
      const newState = { ...prev };
      if (jumlah === 0) delete newState[id];
      else newState[id] = jumlah;
      return newState;
    });
  };

  const totalBayar = Object.entries(lombaDipilih).reduce((acc, [id, jumlah]) => {
    const lomba = LOMBA_LIST.find((l) => l.id === id);
    return acc + jumlah * lomba.biaya;
  }, 0);

  const validateForm = () => {
    const errs = [];
    if (!sekolah.nama.trim()) errs.push('Nama sekolah wajib diisi');
    if (!sekolah.pembina.trim()) errs.push('Nama pembina wajib diisi');
    if (!/^\d{10,}$/.test(sekolah.whatsapp.trim())) errs.push('Nomor WhatsApp tidak valid');
    if (Object.keys(lombaDipilih).length === 0) errs.push('Minimal pilih satu mata lomba');
    Object.entries(lombaDipilih).forEach(([id, jumlah]) => {
      if (jumlah === 0 || isNaN(jumlah)) errs.push(`Jumlah tim tidak valid untuk ${id}`);
    });
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const formPendaftaran = {
        ...sekolah,
        lombaDipilih,
        totalBayar,
      };
      localStorage.setItem('formPendaftaran', JSON.stringify(formPendaftaran));
      router.push('/pembayaran');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-100 text-orange-900">
      <div className="max-w-4xl mx-auto px-4 py-6 md:px-6 relative">
        <Image
          src="/desain-p3k.png"
          alt="Logo P3K"
          className="absolute top-0 right-4 w-32 md:w-48 h-auto z-10"
        />

        <Sun className="absolute top-4 right-4 w-10 h-10 text-yellow-400 animate-pulse" />
        <Mountain className="absolute bottom-0 left-0 w-16 h-16 text-gray-400 opacity-40" />
        <CloudSun className="absolute bottom-10 right-10 w-14 h-14 text-yellow-300 opacity-50" />

        <motion.h1
          className="text-3xl md:text-4xl font-extrabold mb-6 text-orange-600"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Formulir Pendaftaran P3K
        </motion.h1>

        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg space-y-2">
            {errors.map((err, idx) => (
              <p key={idx} className="text-sm">• {err}</p>
            ))}
          </div>
        )}

        <motion.section className="space-y-4 mb-10 border border-black p-4 rounded-lg bg-white/60" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-xl font-semibold">1. Data Sekolah</h2>
          <Input placeholder="Nama Sekolah" value={sekolah.nama} onChange={(e) => setSekolah({ ...sekolah, nama: e.target.value })} />
          <Input placeholder="Nama Pembina" value={sekolah.pembina} onChange={(e) => setSekolah({ ...sekolah, pembina: e.target.value })} />
          <Input placeholder="Nomor WhatsApp Pembina" value={sekolah.whatsapp} onChange={(e) => setSekolah({ ...sekolah, whatsapp: e.target.value })} />
          <RadioGroup defaultValue="wira" onValueChange={(val) => setSekolah({ ...sekolah, kategori: val })}>
            <div className="flex items-center gap-4">
              <RadioGroupItem value="wira" id="wira" className="border border-black" />
              <Label htmlFor="wira">Wira</Label>
              <RadioGroupItem value="madya" id="madya" className="border border-black" />
              <Label htmlFor="madya">Madya</Label>
            </div>
          </RadioGroup>
        </motion.section>

        <motion.section className="space-y-6 mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <h2 className="text-xl font-semibold">2. Pilih Mata Lomba & Jumlah Tim</h2>
          {LOMBA_LIST.map((lomba) => (
            <motion.div key={lomba.id} whileHover={{ scale: 1.02 }} className="border border-black p-4 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md bg-white/60">
              <Label>{lomba.name} (Rp.{lomba.biaya}/Tim)</Label>
              <div className="mt-2 flex gap-2 items-center">
                <Checkbox
                  id={lomba.id}
                  className="border-black"
                  checked={lomba.id in lombaDipilih}
                  onCheckedChange={(checked) => handleLombaChange(lomba.id, checked ? 1 : 0)}
                />
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }}>
                  {lomba.id in lombaDipilih && (
                    <>
                      <Input type="number" className="w-24 mt-2" min={1} max={3} value={lombaDipilih[lomba.id]} onChange={(e) => handleLombaChange(lomba.id, Math.min(3, Number(e.target.value)))} />
                      <span className="text-sm text-muted-foreground">Tim (max 3), {lomba.orangPerTim} orang/tim</span>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.section>

        <motion.section className="space-y-6 mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <h2 className="text-xl font-semibold">3. Daftar Nama Peserta</h2>
          {Object.entries(lombaDipilih).map(([id, jumlahTim]) => {
            const lomba = LOMBA_LIST.find((l) => l.id === id);
            return (
              <div key={id} className="border border-black p-4 rounded-lg bg-white/60">
                <h3 className="font-semibold mb-2">{lomba.name}</h3>
                {[...Array(jumlahTim)].map((_, timIdx) => (
                  <motion.div key={timIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: timIdx * 0.1 }} className="mb-4">
                    <Label>Tim {timIdx + 1}</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                      {[...Array(lomba.orangPerTim)].map((_, anggotaIdx) => (
                        <Input key={anggotaIdx} placeholder={`Nama Peserta ${anggotaIdx + 1}`} />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            );
          })}
        </motion.section>

        <motion.section className="mb-10 border border-black p-4 rounded-lg bg-white/60" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
          <h2 className="text-xl font-semibold">4. Total Biaya</h2>
          <p className="text-2xl font-bold text-orange-600">Rp {totalBayar.toLocaleString()}</p>
        </motion.section>

        <MotionButton whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full text-lg py-6 bg-gradient-to-r from-orange-400 to-pink-500 text-white hover:from-orange-500 hover:to-pink-600 transition-colors" onClick={handleSubmit}>
          Lanjut ke Pembayaran
        </MotionButton>
      </div>
    </div>
  );
}
