'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';

const MotionButton = motion(Button);

type DataPendaftaran = {
  sekolah: {
    nama: string;
    pembina: string;
    whatsapp: string;
    kategori: string;
  };
  lombaDipilih: Record<string, number>;
  peserta: Record<string, string[][]>;
  totalBayar: number;
};

export default function PembayaranPage() {
  const router = useRouter();
  const [dataPendaftaran, setDataPendaftaran] = useState<DataPendaftaran | null>(null);
  const [bukti, setBukti] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('formPendaftaran');
    if (stored) {
      setDataPendaftaran(JSON.parse(stored));
    } else {
      alert('Data pendaftaran tidak ditemukan.');
      router.push('/daftar');
    }
  }, [router]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setBukti(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!bukti) {
      alert('Harap upload bukti pembayaran!');
      return;
    }

    setLoading(true);

    const rows: Record<string, string | number | undefined>[] = [];
    const pesertaData = dataPendaftaran?.peserta || {};
    const sekolah: {
      nama: string;
      pembina: string;
      whatsapp: string;
      kategori: string;
    } = dataPendaftaran?.sekolah!;
    

    Object.entries(pesertaData).forEach(([, timList]) => {
      timList.forEach((anggota) => {
        anggota.forEach((nama) => {
          rows.push({
            nomor: '',
            nama_sekolah: sekolah.nama,
            pembina: sekolah.pembina,
            whatsapp: sekolah.whatsapp,
            kategori: sekolah.kategori,
            lomba: '',
            peserta: nama,
            total: dataPendaftaran?.totalBayar.toString() || '0',
            bukti: bukti?.name || 'Belum Upload',
            ...Object.fromEntries(
              Object.entries(dataPendaftaran?.lombaDipilih || {}).map(([id, jumlah]) => [id, jumlah.toString()])
            )
          });
        });
      });
    });

    try {
      const res = await fetch('https://sheetdb.io/api/v1/l7x727oogr9o3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: rows })
      });

      if (res.ok) {
        alert('✅ Data berhasil dikirim!');
        router.push('/sukses');
      } else {
        alert('❌ Gagal mengirim data!');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Terjadi kesalahan saat mengirim!');
    } finally {
      setLoading(false);
    }
  };

  if (!dataPendaftaran) return <p className="p-6">Memuat data...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-orange-100 px-4 py-8 text-orange-900">
      <div className="max-w-3xl mx-auto bg-white/80 border p-6 rounded-lg shadow space-y-6">
        <h1 className="text-2xl font-bold text-orange-700 text-center">Konfirmasi Pembayaran</h1>

        {/* Info Sekolah */}
        <div className="space-y-1 text-sm">
          <p><strong>Nama Sekolah:</strong> {dataPendaftaran.sekolah.nama}</p>
          <p><strong>Pembina:</strong> {dataPendaftaran.sekolah.pembina}</p>
          <p><strong>WhatsApp:</strong> {dataPendaftaran.sekolah.whatsapp}</p>
          <p><strong>Kategori:</strong> {dataPendaftaran.sekolah.kategori}</p>
        </div>

        {/* Info Rekening */}
        <div className="bg-yellow-50 border border-yellow-400 p-4 rounded-md">
          <p className="text-sm font-semibold text-yellow-800">Silakan transfer ke rekening berikut:</p>
          <p className="mt-1">Bank BRI</p>
          <p>No. Rekening: <strong>1234 5678 9012 3456</strong></p>
          <p>Atas Nama: <strong>Panitia P3K 2025</strong></p>
        </div>

        {/* Upload Bukti */}
        <div>
          <Label className="block mb-1 font-medium">Upload Bukti Pembayaran</Label>
          <Input type="file" accept="image/*,application/pdf" onChange={handleUpload} className="bg-white border" />
          {bukti && <p className="text-sm text-green-700 mt-1">📎 {bukti.name}</p>}
        </div>

        {/* Submit */}
        <MotionButton
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading}
          onClick={handleSubmit}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
        >
          {loading ? 'Mengirim...' : 'Kirim & Selesai'}
        </MotionButton>
      </div>
    </div>
  );
}
