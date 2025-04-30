'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { LOMBA_LIST } from '@/data/lomba';
import { supabase } from '@/lib/supabase';

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
    try {
      const stored = localStorage.getItem('formPendaftaran');
      if (stored) {
        const data = JSON.parse(stored);
        if (!data?.sekolah?.nama) throw new Error('Data tidak lengkap');
        setDataPendaftaran(data);

        const now = new Date();
        const offset = 7 * 60 * 60 * 1000;
        const wib = new Date(now.getTime() + offset);
        const pad = (n: number) => String(n).padStart(2, '0');
        const timestamp = `${wib.getFullYear()}${pad(wib.getMonth() + 1)}${pad(wib.getDate())}${pad(wib.getHours())}${pad(wib.getMinutes())}`;
        const nomor = `P3K2025-${data.sekolah.nama.replace(/\s+/g, '').toUpperCase().slice(0, 10)}-${timestamp}`;
        setNomor(nomor);
      } else {
        router.push('/daftar');
      }
    } catch (error) {
      console.error('Gagal parsing localStorage:', error);
      router.push('/daftar');
    }
  }, [router]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        alert('File harus berupa gambar atau PDF!');
        return;
      }
      setBukti(file);
    }
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

    try {
      // Upload bukti ke Supabase Storage
      const buktiPath = `bukti/${nomor}_${bukti.name}`;
      const { error: uploadError } = await supabase.storage
        .from('bukti-pembayaran')
        .upload(buktiPath, bukti, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw new Error('Gagal upload bukti: ' + uploadError.message);

      const { data: urlData } = supabase
        .storage
        .from('bukti-pembayaran')
        .getPublicUrl(buktiPath);

      if (!urlData || !urlData.publicUrl) {
        throw new Error('Gagal mendapatkan URL bukti.');
      }

      const buktiUrl = urlData.publicUrl;


      // Simpan data pendaftaran
      const { data: pendaftaranData, error: pendaftaranError } = await supabase
        .from('pendaftaran')
        .insert([{
          nomor,
          nama_sekolah: dataPendaftaran.sekolah.nama,
          pembina: dataPendaftaran.sekolah.pembina,
          whatsapp: dataPendaftaran.sekolah.whatsapp,
          kategori: dataPendaftaran.sekolah.kategori,
          ...Object.fromEntries(
            Object.entries(dataPendaftaran.lombaDipilih).map(([id, jumlah]) =>
              [id.replace(/-/g, '_'), jumlah]
            )
          ),
          total: dataPendaftaran.totalBayar,
          bukti: buktiUrl,
          nama_pengirim: namaPengirim
        }])
        .select();

      if (pendaftaranError || !pendaftaranData || pendaftaranData.length === 0) {
        throw new Error('Gagal menyimpan data pendaftaran.');
      }

      const pendaftaranId = pendaftaranData[0].id;

      // Simpan data peserta
      const allPeserta: string[] = [];
      Object.values(dataPendaftaran.peserta).forEach((timList) => {
        timList.forEach((anggota) => {
          anggota.forEach((nama) => {
            if (nama.trim()) allPeserta.push(nama.trim());
          });
        });
      });

      const { error: pesertaError } = await supabase
        .from('peserta')
        .insert(allPeserta.map(nama => ({
          pendaftaran_id: pendaftaranId,
          nama_sekolah: dataPendaftaran.sekolah.nama,
          data_peserta: nama
        })));

      if (pesertaError) throw new Error('Gagal menyimpan data peserta: ' + pesertaError.message);
      
      await fetch('/api/notifikasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          namaSekolah: dataPendaftaran.sekolah.nama,
          pembina: dataPendaftaran.sekolah.pembina,
          whatsapp: dataPendaftaran.sekolah.whatsapp,
          buktiUrl,
          namaPengirim,
        })
      });

      alert('✅ Data berhasil dikirim!');
      localStorage.setItem('namaPengirim', namaPengirim);
      router.push('/kwitansi');
    } catch (err: any) {
      console.error('Error:', err);
      alert('❌ Gagal mengirim data: ' + err.message);
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
              return (
                <li key={id}>
                  {lomba?.nama || id} × {jumlah} tim = <strong>Rp {(jumlah * (lomba?.biaya ?? 0)).toLocaleString('id-ID')}</strong>
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
