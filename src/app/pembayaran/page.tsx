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
  const [loading, setLoading] = useState(false);
  const [kodeUnit, setKodeUnit] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem('formPendaftaran');
    if (stored) {
      const parsed = JSON.parse(stored);
      setDataPendaftaran(parsed);

      // Generate kode unit
      (async () => {
        try {
          const countRes = await fetch('https://sheetdb.io/api/v1/l7x727oogr9o3/count');
          const countJson = await countRes.json();
          const nomorUrut = (countJson?.count || 0) + 1;
          const generated = `P3K2025-${parsed.sekolah.nama.replace(/\s+/g, '').toUpperCase()}-${String(nomorUrut).padStart(3, '0')}`;
          setKodeUnit(generated);
        } catch {
          setKodeUnit('P3K2025-UNKNOWN-001');
        }
      })();
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

    if (!dataPendaftaran || !dataPendaftaran.sekolah) {
      alert('Data sekolah tidak ditemukan.');
      return;
    }

    setLoading(true);

    const pesertaData = dataPendaftaran.peserta || {};
    const sekolah = dataPendaftaran.sekolah;
    const lombaDipilih = dataPendaftaran.lombaDipilih || {};
    const totalBayar = dataPendaftaran.totalBayar || 0;
    const buktiFile = bukti?.name || 'Belum Upload';

    const allPeserta: string[] = [];
    Object.values(pesertaData).forEach((timList) => {
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
          {kodeUnit && (
            <p className="text-xs text-gray-600 italic">Kode Unit: <span className="font-semibold">{kodeUnit}</span></p>
          )}
          <p><strong>Nama Sekolah:</strong> {dataPendaftaran.sekolah.nama}</p>
          <p><strong>Pembina:</strong> {dataPendaftaran.sekolah.pembina}</p>
          <p><strong>WhatsApp:</strong> {dataPendaftaran.sekolah.whatsapp}</p>
          <p><strong>Kategori:</strong> {dataPendaftaran.sekolah.kategori}</p>
        </div>

        {/* Rincian Biaya */}
        <div className="bg-orange-50 border border-orange-300 p-4 rounded-md space-y-1">
          <h3 className="text-md font-semibold text-orange-800 mb-2">Rincian Biaya</h3>
          <ul className="text-sm text-gray-800">
            {Object.entries(dataPendaftaran.lombaDipilih).map(([id, jumlah]) => {
              const lomba = LOMBA_LIST.find((l) => l.id === id);
              return lomba ? (
                <li key={id}>
                  {lomba.nama} x {jumlah} tim = Rp {(lomba.biaya * jumlah).toLocaleString('id-ID')}
                </li>
              ) : null;
            })}
          </ul>
          <p className="font-bold mt-2">Total: Rp {dataPendaftaran.totalBayar.toLocaleString('id-ID')}</p>
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
