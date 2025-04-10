'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { LOMBA_LIST } from '@/data/lomba';

const MotionButton = motion(Button);

type FormData = {
  nama: string;
  pembina: string;
  whatsapp: string;
  kategori: string;
  lombaDipilih?: Record<string, number>;
  totalBayar: number;
  peserta?: Record<string, string[]>;
};

export default function PembayaranPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [bukti, setBukti] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('formPendaftaran');
    if (saved) {
      setFormData(JSON.parse(saved));
    } else {
      alert('Data pendaftaran tidak ditemukan. Silakan isi ulang.');
      router.push('/daftar');
    }
  }, [router]);

  const getLombaNamaById = (id: string) => {
    const lomba = LOMBA_LIST.find((l) => l.id === id);
    return lomba ? lomba.nama : id;
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setBukti(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!bukti) {
      alert('Harap unggah bukti pembayaran!');
      return;
    }

    setLoading(true);

    const payload = {
      sekolah: {
        nama: formData?.nama,
        pembina: formData?.pembina,
        whatsapp: formData?.whatsapp,
        kategori: formData?.kategori,
      },
      lombaDipilih: formData?.lombaDipilih || {},
      peserta: formData?.peserta || {},
      totalBayar: formData?.totalBayar,
      buktiNamaFile: bukti.name,
    };

    await fetch('/api/pendaftaran', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    alert('Data berhasil dikirim! Anda akan diarahkan.');
    router.push('/sukses');
  };

  if (!formData) {
    return <p className="p-6">Tidak ada data pendaftaran ditemukan.</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-yellow-100 to-orange-100 text-orange-900 px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white/70 rounded-xl p-6 border border-orange-300 shadow">
        <h1 className="text-3xl font-bold text-center mb-6 text-orange-600">Konfirmasi Pembayaran</h1>

        <div className="space-y-4 mb-8 text-sm">
          <p><strong>Nama Sekolah:</strong> {formData.nama}</p>
          <p><strong>Pembina:</strong> {formData.pembina}</p>
          <p><strong>WhatsApp:</strong> {formData.whatsapp}</p>
          <p><strong>Kategori:</strong> {formData.kategori}</p>

          <div>
            <strong>Lomba & Peserta:</strong>
            <ul className="list-disc ml-6">
              {Object.entries(formData.lombaDipilih || {}).map(([id, jumlah]) => (
                <li key={id}>
                  {getLombaNamaById(id)} ({jumlah} tim)
                  {formData.peserta?.[id] && (
                    <ul className="ml-4 list-decimal text-gray-700">
                      {formData.peserta[id].map((nama, idx) => (
                        <li key={idx}>{nama}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-lg font-semibold">
            Total: Rp {formData.totalBayar.toLocaleString('id-ID')}
          </p>
        </div>

        <div className="mb-6">
          <Label className="block mb-2 font-medium">Unggah Bukti Pembayaran</Label>
          <Input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleUpload}
            className="border border-orange-400 bg-white"
          />
          {bukti && (
            <p className="text-sm mt-2 text-green-700">✅ File: {bukti.name}</p>
          )}
        </div>

        <MotionButton
          type="button"
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg"
        >
          {loading ? 'Mengirim...' : 'Konfirmasi & Selesai'}
        </MotionButton>
      </div>
    </div>
  );
}
