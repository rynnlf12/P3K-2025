// pages/admin/statistics.tsx

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Statistics() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: pendaftar, error } = await supabase
          .from('pendaftaran')
          .select('id, kategori, tandu_putra, tandu_putri, pertolongan_pertama, senam_poco_poco, mojang_jajaka, poster, pmr_cerdas');

        if (error) throw error;

        setData(pendaftar);
      } catch (error) {
        console.error('Gagal fetch:', error);
        toast.error('❌ Gagal mengambil data statistik!');
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  // Jumlah peserta per tim
  const pesertaPerTim = {
    tandu_putra: 2,
    tandu_putri: 2,
    pertolongan_pertama: 4,
    senam_poco_poco: 7,
    mojang_jajaka: 2,
    poster: 3,
    pmr_cerdas: 2,
  };

  // Hitung total peserta keseluruhan berdasarkan jumlah tim x peserta per tim
  const totalParticipants = data.reduce((total, row) => {
    total += row.tandu_putra * pesertaPerTim.tandu_putra;
    total += row.tandu_putri * pesertaPerTim.tandu_putri;
    total += row.pertolongan_pertama * pesertaPerTim.pertolongan_pertama;
    total += row.senam_poco_poco * pesertaPerTim.senam_poco_poco;
    total += row.mojang_jajaka * pesertaPerTim.mojang_jajaka;
    total += row.poster * pesertaPerTim.poster;
    total += row.pmr_cerdas * pesertaPerTim.pmr_cerdas;
    return total;
  }, 0);

  // Hitung jumlah peserta berdasarkan lomba
  const lombaData = [
    { name: 'Tandu Putra', participants: data.reduce((sum, row) => sum + row.tandu_putra * pesertaPerTim.tandu_putra, 0) },
    { name: 'Tandu Putri', participants: data.reduce((sum, row) => sum + row.tandu_putri * pesertaPerTim.tandu_putri, 0) },
    { name: 'Pertolongan Pertama', participants: data.reduce((sum, row) => sum + row.pertolongan_pertama * pesertaPerTim.pertolongan_pertama, 0) },
    { name: 'Senam Poco-Poco', participants: data.reduce((sum, row) => sum + row.senam_poco_poco * pesertaPerTim.senam_poco_poco, 0) },
    { name: 'Mojang Jajaka', participants: data.reduce((sum, row) => sum + row.mojang_jajaka * pesertaPerTim.mojang_jajaka, 0) },
    { name: 'Poster', participants: data.reduce((sum, row) => sum + row.poster * pesertaPerTim.poster, 0) },
    { name: 'PMR Cerdas', participants: data.reduce((sum, row) => sum + row.pmr_cerdas * pesertaPerTim.pmr_cerdas, 0) },
  ];

  // Hitung jumlah sekolah berdasarkan kategori Wira/Madya
  const kategoriCounts = {
    wira: data.filter((row) => row.kategori === 'Wira').length,
    madya: data.filter((row) => row.kategori === 'Madya').length,
  };

  // Warna untuk Pie Chart
  // Warna untuk Pie Chart: kuning untuk Wira, biru untuk Madya
  const COLORS = ['#FFBB28', '#0088FE']; // Kuning untuk Wira dan Biru untuk Madya

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-center">📊 Statistik Pendaftaran</h1>

      <div className="flex justify-between space-x-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => toast.info('🔄 Menampilkan Statistik!')}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-t-4 border-gray-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Total Peserta Keseluruhan : {totalParticipants}</h2>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Total Peserta Per Lomba</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={lombaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="participants" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Jumlah Sekolah Berdasarkan Kategori</h2>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie data={[
                  { name: 'Wira', value: kategoriCounts.wira },
                  { name: 'Madya', value: kategoriCounts.madya },
                ]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={150} fill="#8884d8" label>
                  {['Wira', 'Madya'].map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      <ToastContainer />
    </div>
  );
}
