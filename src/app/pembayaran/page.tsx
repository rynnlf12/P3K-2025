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
  const [kodeUnit, setKodeUnit] = useState<string>('');

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
        const unit = `P3K2025-${data.sekolah.nama.replace(/\s+/g, '').toUpperCase().slice(0, 10)}-${timestamp}`;
        setKodeUnit(unit);
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

    if (!dataPendaftaran || !dataPendaftaran.sekolah) {
      alert('Data sekolah tidak ditemukan.');
      return;
    }

    setLoading(true);

    const { peserta, sekolah, lombaDipilih, totalBayar } = dataPendaftaran;
    const buktiFile = bukti?.name || 'Belum Upload';

    const allPeserta: string[] = [];
    Object.values(peserta).forEach((timList) => {
      timList.forEach((anggota) => {
        anggota.forEach((nama) => {
          allPeserta.push(nama);
        });
      });
    });

    const rows = allPeserta.map((nama, index) => {
      const isFirst = index === 0;
      return {
        kode_unit: isFirst ? kodeUnit : '',
        nama_sekolah: isFirst ? sekolah.nama : '',
        pembina: isFirst ? sekolah.pembina : '',
        whatsapp: isFirst ? sekolah.whatsapp : '',
        kategori: isFirst ? sekolah.kategori : '',
        ...Object.fromEntries(
          Object.entries(lombaDipilih).map(([id, jumlah]) => [id, isFirst ? jumlah.toString() : ''])
        ),
        data_peserta: nama,
        total: isFirst ? totalBayar.toString() : '',
        bukti: isFirst ? buktiFile : '',
        nama_pengirim: isFirst ? namaPengirim : '',
        status_verifikasi: isFirst ? 'Menunggu Verifikasi' : '',
      };
    });

    try {
      const res = await fetch('https://sheetdb.io/api/v1/l7x727oogr9o3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: rows }),
      });

      if (res.ok) {
        alert('✅ Data berhasil dikirim!');
        router.push(`/sukses?kode_unit=${kodeUnit}&nama_sekolah=${sekolah.nama}&nama_pengirim=${sekolah.pembina}&whatsapp=${sekolah.whatsapp}&kategori=${sekolah.kategori}&total=${totalBayar}`);
      } else {
        alert('❌ Gagal mengirim data!');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Terjadi kesalahan saat mengirim!');
    } finally {
      setLoading(false);
    }

    // Ganti dengan nomor WhatsApp admin kamu & API key dari CallMeBot
    const adminPhone = "6288802017127"; // tanpa +, misal: 6281234567890
    const apiKey = "6242351"; // dari CallMeBot

    const pesan = `📢 *Pendaftar Baru!*\n\n🏫 *${sekolah.nama}*\n👤 Pembina: ${sekolah.pembina}\n📱 WA: ${sekolah.whatsapp}\n📎 Bukti: ${buktiFile}\n 👤 Nama Pengirim: ${namaPengirim}\n\nHarap verifikasi pembayaran.`;

    await fetch(`https://api.callmebot.com/whatsapp.php?phone=${adminPhone}&text=${encodeURIComponent(pesan)}&apikey=${apiKey}`);

  };

  if (!dataPendaftaran) return <p className="p-6">Memuat data...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-orange-100 px-4 py-8 pt-28 text-orange-900">
      <div className="max-w-3xl mx-auto bg-white/80 border p-6 rounded-lg shadow space-y-6">
        <h1 className="text-2xl font-bold text-orange-700 text-center">Konfirmasi Pembayaran</h1>

        {/* KODE UNIT */}
        <div className="text-center text-sm text-gray-600 font-mono mb-4">
          <span className="text-orange-700 font-bold">Kode Unit:</span> {kodeUnit}
        </div>

        {/* Info Sekolah */}
        <div className="space-y-1 text-sm">
          <p><strong>Nama Sekolah:</strong> {dataPendaftaran.sekolah.nama}</p>
          <p><strong>Pembina:</strong> {dataPendaftaran.sekolah.pembina}</p>
          <p><strong>WhatsApp:</strong> {dataPendaftaran.sekolah.whatsapp}</p>
          <p><strong>Kategori:</strong> {dataPendaftaran.sekolah.kategori}</p>
        </div>

        {/* Rincian Biaya */}
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

        {/* Info Rekening */}
        <div className="bg-yellow-50 border border-yellow-400 p-4 rounded-md">
          <p className="text-sm font-semibold text-yellow-800">Silakan transfer ke rekening berikut:</p>
          <p className="mt-1">Bank BRI</p>
          <p>No. Rekening: <strong>1234 5678 9012 3456</strong></p>
          <p>Atas Nama: <strong>Panitia P3K 2025</strong></p>
        </div>

        {/* Nama Pengirim */}
        <div>
          <Label className="block mb-1 font-medium">Nama Pengirim Transfer</Label>
          <Input
            type="text"
            placeholder="Contoh: Ahmad Fikri"
            value={namaPengirim}
            onChange={(e) => setNamaPengirim(e.target.value)}
            className="bg-white border"
          />
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
