'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';

const MotionButton = motion(Button);

// Define FormData type
type FormData = {
  nama: string;
  pembina: string;
  whatsapp: string;
  kategori: string;
  lomba?: string[];
  lombaDipilih?: Record<string, number>;
  totalBayar: number;
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

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setBukti(e.target.files[0]);
    }
  };

  const kirimDataKeBackend = async () => {
    const payload = {
      nama_sekolah: formData?.nama,
      pembina: formData?.pembina,
      whatsapp: formData?.whatsapp,
      kategori: formData?.kategori,
      lomba: Object.entries(formData?.lombaDipilih || {})
        .map(([id, jumlah]) => `${id} (${jumlah} tim)`) 
        .join(', '),
      total: formData?.totalBayar,
      bukti: bukti?.name || 'Belum Diupload',
    };

    try {
      const res = await fetch('/api/pendaftaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      console.log('✅ Respon dari backend:', result);
    } catch (error) {
      console.error('❌ Gagal kirim ke backend:', error);
    }
  };

  const kirimDataKeSheetDB = async () => {
    const sheetPayload = {
      data: [
        {
          nama_sekolah: formData?.nama,
          pembina: formData?.pembina,
          whatsapp: formData?.whatsapp,
          kategori: formData?.kategori,
          lomba: Object.entries(formData?.lombaDipilih || {})
            .map(([id, jumlah]) => `${id} (${jumlah} tim)`) 
            .join(', '),
          total: formData?.totalBayar,
          bukti: bukti?.name || 'Belum Diupload',
        },
      ],
    };

    try {
      const res = await fetch('https://sheetdb.io/api/v1/l7x727oogr9o3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sheetPayload),
      });
      const result = await res.json();
      console.log('✅ Data terkirim ke SheetDB:', result);
    } catch (error) {
      console.error('❌ Gagal kirim ke SheetDB:', error);
      alert('Gagal kirim data ke Google Sheets');
    }
  };

  const handleSubmit = async () => {
    if (!bukti) {
      alert('Harap unggah bukti pembayaran!');
      return;
    }

    setLoading(true);
    await kirimDataKeBackend();
    await kirimDataKeSheetDB();
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

        <div className="space-y-4 mb-8">
          <p><strong>Nama Sekolah:</strong> {formData.nama}</p>
          <p><strong>Pembina:</strong> {formData.pembina}</p>
          <p><strong>WhatsApp:</strong> {formData.whatsapp}</p>
          <p><strong>Kategori:</strong> {formData.kategori}</p>
          <p><strong>Lomba:</strong> {Object.entries(formData.lombaDipilih || {}).map(([id, jumlah]) => `${id} (${jumlah} tim)`).join(', ')}</p>
          <p><strong>Total Biaya:</strong> <span className="text-green-600 font-bold">Rp {formData.totalBayar.toLocaleString('id-ID')}</span></p>
        </div>

        <div className="mb-8 bg-yellow-100 border border-yellow-400 p-4 rounded-lg">
          <p className="text-sm text-orange-800 font-semibold">Silakan transfer pembayaran ke:</p>
          <p className="mt-1">Bank BRI</p>
          <p>No. Rekening: <strong>1234 5678 9012 3456</strong></p>
          <p>Atas Nama: <strong>Panitia P3K 2025</strong></p>
        </div>

        <div className="mb-6">
          <Label className="block mb-2 font-medium">Unggah Bukti Pembayaran</Label>
          <Input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleUpload}
            className="border border-orange-400 bg-white"
          />
        </div>

        {bukti && (
          <div className="mt-4">
            <p className="mb-2 text-sm text-green-700">File dipilih: {bukti.name}</p>
            {bukti.type.startsWith('image/') && (
              <img
                src={URL.createObjectURL(bukti)}
                alt="Preview Bukti"
                className="w-full max-h-64 object-contain border border-orange-300"
              />
            )}
          </div>
        )}

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
