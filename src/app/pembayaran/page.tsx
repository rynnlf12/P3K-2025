'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { LOMBA_LIST } from '@/data/lomba';

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
  const [namaPengirim, setNamaPengirim] = useState('');
  const [loading, setLoading] = useState(false);
  const [nomor, setNomor] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem('formPendaftaran');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (!data.sekolah?.nama) throw new Error('Data invalid');

        setDataPendaftaran(data);

        const now = new Date();
        const offset = 7 * 60 * 60 * 1000;
        const wib = new Date(now.getTime() + offset);
        const pad = (n: number) => String(n).padStart(2, '0');
        const timestamp = `${wib.getFullYear()}${pad(wib.getMonth() + 1)}${pad(wib.getDate())}${pad(wib.getHours())}${pad(wib.getMinutes())}`;
        const nomor = `P3K2025-${data.sekolah.nama.replace(/\s+/g, '').toUpperCase().slice(0, 10)}-${timestamp}`;
        setNomor(nomor);
      } catch (error) {
        console.error('Error parsing data:', error);
        router.push('/daftar');
      }
    } else {
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

    if (!namaPengirim.trim()) {
      alert('Harap isi nama pengirim transfer!');
      return;
    }

    setLoading(true);

    let buktiUrl = '';
    try {
      const formData = new FormData();
      formData.append('file', bukti);
      formData.append('upload_preset', 'bukti_pembayaran');

      const cloudinaryRes = await fetch('https://api.cloudinary.com/v1_1/dcjpyx1om/upload', {
        method: 'POST',
        body: formData,
      });

      const cloudinaryData = await cloudinaryRes.json();
      if (!cloudinaryRes.ok || !cloudinaryData.secure_url) {
        throw new Error('Gagal mengunggah bukti pembayaran ke Cloudinary.');
      }
      buktiUrl = cloudinaryData.secure_url;
    } catch (err) {
      console.error('Gagal upload ke Cloudinary:', err);
      alert('❌ Gagal upload bukti pembayaran.');
      setLoading(false);
      return;
    }

    if (!dataPendaftaran) return;
    const { peserta, sekolah, lombaDipilih, totalBayar } = dataPendaftaran;
    const allPeserta: string[] = [];
    Object.values(peserta).forEach((timList) => {
      timList.forEach((anggota) => {
        anggota.forEach((nama) => {
          allPeserta.push(nama);
        });
      });
    });

    const rows = allPeserta.map((nama, index) => {
      const commonLombaCols = Object.fromEntries(
        Object.entries(lombaDipilih).map(([id]) => [id, index === 0 ? lombaDipilih[id].toString() : ''])
      );
    
      if (index === 0) {
        return {
          nomor,
          nama_sekolah: sekolah.nama,
          pembina: sekolah.pembina,
          whatsapp: sekolah.whatsapp,
          kategori: sekolah.kategori,
          ...commonLombaCols,
          data_peserta: nama,
          total: totalBayar.toString(),
          bukti: buktiUrl,
          nama_pengirim: namaPengirim,
          status_verifikasi: 'Menunggu Verifikasi',
        };
      } else {
        return {
          nomor: '',
          nama_sekolah: '',
          pembina: '',
          whatsapp: '',
          kategori: '',
          ...Object.fromEntries(Object.keys(lombaDipilih).map((id) => [id, ''])),
          data_peserta: nama,
          total: '',
          bukti: '',
          nama_pengirim: '',
          status_verifikasi: ''
        };
      }
    });

    try {
      console.log('DATA YANG DIKIRIM KE SHEETDB:', JSON.stringify({ data: rows }, null, 2));
      const res = await fetch('https://sheetdb.io/api/v1/l7x727oogr9o3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: rows }),
      });

      if (res.ok) {
        alert('✅ Data berhasil dikirim!');
        localStorage.setItem('namaPengirim', namaPengirim);
        localStorage.setItem('formPendaftaran', JSON.stringify(dataPendaftaran));
        localStorage.setItem('nomor', nomor);

        const adminPhone = '6288802017127';
        const apiKey = '6242351';
        const pesan = `📢 *Pendaftar Baru!*\n\n🏫 *${sekolah.nama}*\n👤 Pembina: ${sekolah.pembina}\n📱 WA: ${sekolah.whatsapp}\n📎 Bukti: ${buktiUrl}\n👤 Nama Pengirim: ${namaPengirim}\n\nHarap verifikasi pembayaran.`;

        await fetch(`https://api.callmebot.com/whatsapp.php?phone=${adminPhone}&text=${encodeURIComponent(pesan)}&apikey=${apiKey}`);

        console.log('✅ Mengarahkan ke halaman kwitansi...');
        router.push('/kwitansi');
      } else {
        alert('❌ Gagal mengirim data!');
      }
    } catch (err) {
      console.error('Terjadi kesalahan saat mengirim data:', err);
      alert('❌ Terjadi kesalahan saat mengirim!');
    } finally {
      setLoading(false);
    }
  };

  if (!dataPendaftaran) return <p className="p-6">Memuat data...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-orange-100 px-4 py-8 pt-28 text-orange-900">
      <div className="max-w-3xl mx-auto bg-white/80 border p-6 rounded-lg shadow space-y-6">
        <h1 className="text-2xl font-bold text-orange-700 text-center">Konfirmasi Pembayaran</h1>

        <div className="text-center text-sm text-gray-600 font-mono mb-4">
          <span className="text-orange-700 font-bold">Nomor:</span> {nomor}
        </div>

        <div className="space-y-1 text-sm">
          <p><strong>Nama Sekolah:</strong> {dataPendaftaran.sekolah.nama}</p>
          <p><strong>Pembina:</strong> {dataPendaftaran.sekolah.pembina}</p>
          <p><strong>WhatsApp:</strong> {dataPendaftaran.sekolah.whatsapp}</p>
          <p><strong>Kategori:</strong> {dataPendaftaran.sekolah.kategori}</p>
        </div>

        <div className="bg-orange-50 border border-orange-300 rounded p-4 text-sm">
          <h3 className="font-semibold text-orange-700 mb-2">Rincian Biaya:</h3>
          <ul className="space-y-1">
            {Object.entries(dataPendaftaran.lombaDipilih).map(([id, jumlah]) => {
              const lomba = LOMBA_LIST.find((l) => l.id === id);
              if (!lomba) return null;
              return (
                <li key={id}>
                  {lomba.nama} × {jumlah} tim = <strong>Rp {(jumlah * lomba.biaya).toLocaleString('id-ID')}</strong>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 font-bold text-orange-800">Total: Rp {dataPendaftaran.totalBayar.toLocaleString('id-ID')}</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-400 p-4 rounded-md">
          <p className="text-sm font-semibold text-yellow-800">Silakan transfer ke rekening berikut:</p>
          <p className="mt-1">Bank <strong>BCA</strong></p>
          <p>No. Rekening: <strong>4020701434</strong></p>
          <p>Atas Nama: <strong>Kayla Andini Putri</strong></p>
        </div>

        <div>
          <Label className="block mb-1 font-medium">Nama Pengirim Transfer</Label>
          <Input
            type="text"
            placeholder="Contoh: Ryan Alfaridzy"
            value={namaPengirim}
            onChange={(e) => setNamaPengirim(e.target.value)}
            className="bg-white border"
          />
        </div>

        <div>
          <Label className="block mb-1 font-medium">Upload Bukti Pembayaran</Label>
          <Input type="file" accept="image/*,application/pdf" onChange={handleUpload} className="bg-white border" />
          {bukti && <p className="text-sm text-green-700 mt-1">📎 {bukti.name}</p>}
        </div>

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
