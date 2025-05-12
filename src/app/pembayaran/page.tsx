'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { LOMBA_LIST } from '@/data/lomba';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

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

      if (!urlData?.publicUrl) {
        throw new Error('Gagal mendapatkan URL bukti.');
      }

      const buktiUrl = urlData.publicUrl;

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

      if (pendaftaranError || !pendaftaranData?.[0]) {
        throw new Error('Gagal menyimpan data pendaftaran.');
      }

      const pendaftaranId = pendaftaranData[0].id;

      type PesertaInsert = {
        pendaftaran_id: string;
        nama_sekolah: string;
        lomba: string;
        data_peserta: string;
      };
      
      const pesertaInsert: PesertaInsert[] = [];

for (const [lombaId, timList] of Object.entries(dataPendaftaran.peserta)) {
  const lombaNama = LOMBA_LIST.find((l) => l.id === lombaId)?.nama ?? lombaId;

  for (const tim of timList) {
    for (const nama of tim) {
      if (nama.trim()) {
        pesertaInsert.push({
          pendaftaran_id: pendaftaranId,  // pastikan pendaftaranId adalah UUID yang valid
          nama_sekolah: dataPendaftaran.sekolah.nama,
          lomba: lombaNama,
          data_peserta: nama.trim() // pastikan data_peserta berupa string
        });
      }
    }
  }
}

const { error: pesertaError } = await supabase
  .from('peserta')
  .insert(pesertaInsert);

if (pesertaError) {
  throw new Error('Gagal menyimpan data peserta: ' + pesertaError.message);
}

      
      

      // Kirim notifikasi ke admin
      const notifikasi = await fetch('/api/notifikasi', {
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

      if (!notifikasi.ok) {
        console.warn('Notifikasi WA gagal total');
      } else {
        const notifResult = await notifikasi.json();
        if (notifResult.fallback) {
          alert('✅ Data berhasil dikirim. Namun notifikasi admin belum terkirim otomatis, akan diproses manual.');
        }
      }

      alert('✅ Data berhasil dikirim!');
      localStorage.setItem('namaPengirim', namaPengirim);
      router.push('/kwitansi');
    } catch (err: any) {
      console.error('Error kirim:', err);
      alert('❌ Gagal mengirim data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

   if (!dataPendaftaran) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse text-gray-600">
        Memuat data pendaftaran...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mx-auto">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Konfirmasi Pembayaran</h1>
          <div className="text-sm font-mono bg-gray-100 px-4 py-2 rounded-lg inline-block">
            Nomor Registrasi: <span className="text-yellow-600">{nomor}</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 space-y-8">
          {/* School Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Informasi Sekolah</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <dt className="text-gray-500">Nama Sekolah</dt>
                <dd className="font-medium">{dataPendaftaran.sekolah.nama}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-gray-500">Nama Pembina</dt>
                <dd className="font-medium">{dataPendaftaran.sekolah.pembina}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-gray-500">Nomor WhatsApp</dt>
                <dd className="font-medium">{dataPendaftaran.sekolah.whatsapp}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-gray-500">Kategori</dt>
                <dd className="font-medium">{dataPendaftaran.sekolah.kategori}</dd>
              </div>
            </dl>
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Rincian Pembayaran</h2>
            <div className="space-y-3">
              {Object.entries(dataPendaftaran.lombaDipilih).map(([id, jumlah]) => {
                const lomba = LOMBA_LIST.find((l) => l.id === id);
                return (
                  <div key={id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <div>
                      <p className="font-medium">{lomba?.nama || id}</p>
                      <p className="text-sm text-gray-500">{jumlah} tim</p>
                    </div>
                    <span className="font-medium">
                      Rp {(jumlah * (lomba?.biaya ?? 0)).toLocaleString('id-ID')}
                    </span>
                  </div>
                );
              })}
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="font-semibold">Total Pembayaran</span>
                <span className="text-xl font-bold text-red-600">
                  Rp {dataPendaftaran.totalBayar.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* Bank Transfer */}
          <div className="bg-yellow-50 p-6 rounded-xl space-y-3">
            <h3 className="font-semibold text-red-600">Instruksi Pembayaran</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3 bg-white p-4 rounded-lg">
                <Image 
                  src="/bca-logo.png" 
                  alt="BCA" 
                  width={80} 
                  height={32}
                  className="h-8 w-auto"
                />
                <div>
                  <p className="font-medium">Bank Central Asia (BCA)</p>
                  <div className="mt-1 space-y-1">
                    <p>Nomor Rekening: <span className="font-mono">4020 7014 34</span></p>
                    <p>Atas Nama: <span className="font-medium">Kayla Andini Putri</span></p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <p className="text-red-600 font-medium">✱ Pastikan jumlah transfer sesuai total pembayaran</p>
                <p className="text-gray-600 mt-2">Upload bukti transfer dalam format JPG/PNG/PDF (maks. 5MB)</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Nama Pengirim Transfer
                <Input
                  type="text"
                  placeholder="Nama sesuai rekening pengirim"
                  value={namaPengirim}
                  onChange={(e) => setNamaPengirim(e.target.value)}
                  className="mt-1"
                />
              </label>
              
              <label className="block text-sm font-medium text-gray-700">
                Upload Bukti Transfer
                <div className="mt-1 flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mt-1 text-sm text-gray-600">
                        {bukti ? bukti.name : 'Klik untuk memilih file'}
                      </p>
                    </div>
                    <Input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </label>
            </div>

            <MotionButton
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              onClick={handleSubmit}
              className="w-full py-3 bg-gradient-to-r from-yellow-600 to-red-600 text-whitehover:from-yellow-700 hover:to-red-700 transition-all text-white font-medium"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Mengirim Data...
                </div>
              ) : (
                'Konfirmasi Pembayaran'
              )}
            </MotionButton>
          </div>
        </div>
      </div>
    </div>
  );
}