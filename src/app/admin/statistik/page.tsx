'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Icons
import { FiDollarSign, FiUsers, FiHome, FiRefreshCw } from 'react-icons/fi';

interface Pendaftaran {
  id: string;
  kategori: string;
  tandu_putra: number;
  tandu_putri: number;
  pertolongan_pertama: number;
  senam_poco_poco: number;
  mojang_jajaka: number;
  poster: number;
  pmr_cerdas: number;
  total: number;
}

export default function Statistics() {
  const [data, setData] = useState<Pendaftaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);

  // Modern color palette
  const colors = {
    primary: '#6366f1',
    secondary: '#10b981',
    background: '#f8fafc',
    text: '#0f172a',
    dark: {
      background: '#0f172a',
      text: '#f8fafc'
    }
  };

  const pesertaPerTim = {
    tandu_putra: 2,
    tandu_putri: 2,
    pertolongan_pertama: 4,
    senam_poco_poco: 10,
    mojang_jajaka: 2,
    poster: 3,
    pmr_cerdas: 2,
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: pendaftar, error } = await supabase
          .from('pendaftaran')
          .select('*');

        if (error) throw error;

        setData(pendaftar as Pendaftaran[]);
        setTotalIncome(pendaftar.reduce((sum: number, item: Pendaftaran) => sum + (item.total || 0), 0));
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Gagal memuat data statistik');
      }
      setLoading(false);
    };

    fetchData();
  }, []);

const totalParticipants = data.reduce((total: number, row: Pendaftaran) => {
  return (
    total +
    ((row.tandu_putra || 0) * pesertaPerTim.tandu_putra) +
    ((row.tandu_putri || 0) * pesertaPerTim.tandu_putri) +
    ((row.pertolongan_pertama || 0) * pesertaPerTim.pertolongan_pertama) +
    ((row.senam_poco_poco || 0) * pesertaPerTim.senam_poco_poco) +
    ((row.mojang_jajaka || 0) * pesertaPerTim.mojang_jajaka) +
    ((row.poster || 0) * pesertaPerTim.poster) +
    ((row.pmr_cerdas || 0) * pesertaPerTim.pmr_cerdas)
  );
}, 0);

  const chartData = {
    lomba: [
      { name: 'Tandu Putra', value: data.reduce((sum, row) => sum + row.tandu_putra * pesertaPerTim.tandu_putra, 0) },
      { name: 'Tandu Putri', value: data.reduce((sum, row) => sum + row.tandu_putri * pesertaPerTim.tandu_putri, 0) },
      { name: 'Pertolongan Pertama', value: data.reduce((sum, row) => sum + row.pertolongan_pertama * pesertaPerTim.pertolongan_pertama, 0) },
      { name: 'Senam Poco-Poco', value: data.reduce((sum, row) => sum + row.senam_poco_poco * pesertaPerTim.senam_poco_poco, 0) },
      { name: 'Mojang Jajaka', value: data.reduce((sum, row) => sum + row.mojang_jajaka * pesertaPerTim.mojang_jajaka, 0) },
      { name: 'Poster', value: data.reduce((sum, row) => sum + row.poster * pesertaPerTim.poster, 0) },
      { name: 'PMR Cerdas', value: data.reduce((sum, row) => sum + row.pmr_cerdas * pesertaPerTim.pmr_cerdas, 0) },
    ],
    kategori: [
      { name: 'Wira', value: data.filter(row => row.kategori === 'Wira').length },
      { name: 'Madya', value: data.filter(row => row.kategori === 'Madya').length },
    ]
  };

  const StatCard = ({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) => (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-${color}-100 dark:bg-${color}-900/20`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              Dashboard Statistik
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Analisis data pendaftaran terkini</p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
          >
            <FiRefreshCw className="w-5 h-5" />
            <span>Refresh Data</span>
          </Button>
        </div>

        {/* Statistik Utama */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32 bg-white dark:bg-gray-800 rounded-2xl" />
            ))
          ) : (
            <>
              <StatCard
                title="Total Pendapatan"
                value={new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0
                }).format(totalIncome)}
                icon={<FiDollarSign className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                color="indigo"
              />
              <StatCard
                title="Total Peserta"
                value={totalParticipants.toLocaleString('id-ID')}
                icon={<FiUsers className="w-6 h-6 text-green-600 dark:text-green-400" />}
                color="green"
              />
              <StatCard
                title="Total Sekolah"
                value={data.length.toLocaleString('id-ID')}
                icon={<FiHome className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
                color="purple"
              />
            </>
          )}
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold mb-5 text-gray-900 dark:text-white">
              Distribusi Peserta per Lomba
            </h3>
            <div className="h-80">
              {loading ? (
                <Skeleton className="h-full w-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.lomba}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: colors.text, className: 'text-xs' }}
                      stroke={colors.text}
                    />
                    <YAxis 
                      tick={{ fill: colors.text }}
                      stroke={colors.text}
                    />
                    <Tooltip
                      contentStyle={{
                        background: colors.background,
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill={colors.primary}
                      radius={[6, 6, 0, 0]}
                      animationDuration={500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold mb-5 text-gray-900 dark:text-white">
              Distribusi Kategori Sekolah
            </h3>
            <div className="h-80">
              {loading ? (
                <Skeleton className="h-full w-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.kategori}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={70}
                      paddingAngle={2}
                    >
                      {chartData.kategori.map((_, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={index % 2 === 0 ? colors.primary : colors.secondary}
                        />
                      ))}
                    </Pie>
                    <Legend 
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      wrapperStyle={{ right: -20 }}
                      formatter={(value) => (
                        <span className="text-gray-600 dark:text-gray-300">{value}</span>
                      )}
                    />
                    <Tooltip
                      contentStyle={{
                        background: colors.background,
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
        theme="colored"
        toastClassName="rounded-lg shadow-sm font-medium"
      />
    </div>
  );
}