'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';

const MotionButton = motion(Button);

export default function PembayaranPage() {
  const router = useRouter();
  const [dataPendaftaran, setDataPendaftaran] = useState<any>(null);
  const [bukti, setBukti] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  // const [success, setSuccess] = useState(false); // dihapus karena tidak terpakai


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

    const payload = {
      data: [
        {
          nama_sekolah: dataPendaftaran?.sekolah.nama || '',
          pembina: dataPendaftaran?.sekolah.pembina || '',
          whatsapp: dataPendaftaran?.sekolah.whatsapp || '',
          kategori: dataPendaftaran?.sekolah.kategori || '',
          lomba: Object.entries(dataPendaftaran?.lombaDipilih || {})
            .map(([id, jumlah]) => `${id} (${jumlah} tim)`)
            .join(', '),
          peserta: Object.entries(dataPendaftaran?.peserta || {})
            .map(([id, pesertaList]) => `${id}: ${pesertaList.join(', ')}`)
            .join(' | '),
          total: dataPendaftaran?.totalBayar || 0,
          bukti: bukti?.name || 'Belum Upload'
        }
      ]
    };

    try {
      const res = await fetch('https://sheetdb.io/api/v1/l7x727oogr9o3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const updatedData = {
          ...dataPendaftaran,
          buktiNamaFile: bukti.name,
        };
        localStorage.setItem('formPendaftaran', JSON.stringify(updatedData));
        setSuccess(true);
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

        {/* Informasi Sekolah */}
        <div className="space-y-1 text-sm">
          <p><strong>Nama Sekolah:</strong> {dataPendaftaran.sekolah.nama}</p>
          <p><strong>Pembina:</strong> {dataPendaftaran.sekolah.pembina}</p>
          <p><strong>WhatsApp:</strong> {dataPendaftaran.sekolah.whatsapp}</p>
          <p><strong>Kategori:</strong> {dataPendaftaran.sekolah.kategori}</p>
        </div>

        {/* Informasi Lomba */}
        <div className="space-y-1 text-sm">
          <h2 className="font-semibold text-orange-600 mt-4">Rincian Lomba</h2>
          <ul className="list-disc pl-5">
            {Object.entries(dataPendaftaran.lombaDipilih).map(([id, jumlah]) => (
              <li key={id}>{id} - {jumlah} tim</li>
            ))}
          </ul>
        </div>

        {/* Informasi Peserta */}
        <div className="space-y-1 text-sm">
          <h2 className="font-semibold text-orange-600 mt-4">Nama Peserta</h2>
          {Object.entries(dataPendaftaran.peserta).map(([id, namaList]: [string, string[]]) => (
            <div key={id}>
              <p className="font-medium">{id}:</p>
              <ul className="list-disc pl-5 text-sm text-gray-800">
                {namaList.map((nama, idx) => (
                  <li key={idx}>{nama}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Informasi Pembayaran */}
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

        {/* Tombol Submit */}
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
