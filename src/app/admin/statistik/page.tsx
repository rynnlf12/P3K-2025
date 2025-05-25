'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';

// --- Ikon Lucide ---
import { 
    DollarSign, Users, Home, RefreshCw, BarChart3, PieChart as PieIcon, 
    Users2, Trophy 
} from 'lucide-react';

// --- Tipe Data (Sama) ---
interface Pendaftaran {
    id: string;
    kategori: string;
    nama_sekolah: string; // Tambahkan jika ingin menampilkan data sekolah
    tandu_putra: number;
    tandu_putri: number;
    pertolongan_pertama: number;
    senam_poco_poco: number;
    mojang_jajaka: number;
    poster: number;
    pmr_cerdas: number;
    total: number;
    created_at: string; // Tambahkan untuk potensi chart tren
}

// --- Data Peserta per Tim (Sama) ---
const pesertaPerTim = {
    tandu_putra: 2,
    tandu_putri: 2,
    pertolongan_pertama: 4,
    senam_poco_poco: 10,
    mojang_jajaka: 2,
    poster: 3,
    pmr_cerdas: 2,
};

// --- Nama Lomba yang Lebih Baik ---
const lombaNames: Record<string, string> = {
    tandu_putra: 'Tandu Putra',
    tandu_putri: 'Tandu Putri',
    pertolongan_pertama: 'Pertolongan Pertama',
    senam_poco_poco: 'Senam Poco-Poco',
    mojang_jajaka: 'Mojang Jajaka',
    poster: 'Poster',
    pmr_cerdas: 'PMR Cerdas',
};

// --- Palet Warna Modern & Menarik ---
const COLORS = [
    '#6366f1', // Indigo
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#3b82f6', // Blue
    '#a855f7', // Purple
    '#ec4899', // Pink
];

// --- Komponen Kartu Statistik ---
const StatCard = ({ title, value, icon, color, trend }: { title: string; value: string | number; icon: React.ReactNode; color: string; trend?: string }) => (
    <motion.div
        className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
        whileHover={{ scale: 1.03 }}
    >
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/30`}>
                {icon}
            </div>
            {trend && <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{trend}</span>}
        </div>
        <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{value}</p>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
    </motion.div>
);

// --- Komponen Chart Wrapper ---
const ChartCard = ({ title, children, icon }: { title: string; children: React.ReactNode, icon: React.ReactNode }) => (
    <motion.div 
        className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <h3 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white flex items-center">
            {icon}
            <span className="ml-2">{title}</span>
        </h3>
        <div className="h-80 sm:h-96">
            {children}
        </div>
    </motion.div>
);

export default function Statistics() {
    const [data, setData] = useState<Pendaftaran[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: pendaftar, error } = await supabase
                .from('pendaftaran')
                .select('*')
                .order('created_at', { ascending: true }); // Order by date for trend

            if (error) throw error;
            setData(pendaftar as Pendaftaran[]);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Gagal memuat data statistik');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- Kalkulasi Data ---
    const totalIncome = data.reduce((sum, item) => sum + (item.total || 0), 0);
    const totalSchools = data.length;
    
    const totalTim = Object.keys(pesertaPerTim).reduce((total, lombaKey) => 
        total + data.reduce((sum, row) => sum + (row[lombaKey as keyof Pendaftaran] as number || 0), 0)
    , 0);

    const totalParticipants = Object.keys(pesertaPerTim).reduce((total, lombaKey) => 
        total + data.reduce((sum, row) => sum + ((row[lombaKey as keyof Pendaftaran] as number || 0) * pesertaPerTim[lombaKey as keyof typeof pesertaPerTim]), 0)
    , 0);
    
    // --- Data untuk Charts ---
    const pesertaPerLombaData = Object.keys(pesertaPerTim).map((key, index) => ({
        name: lombaNames[key],
        value: data.reduce((sum, row) => sum + ((row[key as keyof Pendaftaran] as number || 0) * pesertaPerTim[key as keyof typeof pesertaPerTim]), 0),
        fill: COLORS[index % COLORS.length],
    }));

    const timPerLombaData = Object.keys(pesertaPerTim).map((key, index) => ({
        name: lombaNames[key],
        value: data.reduce((sum, row) => sum + (row[key as keyof Pendaftaran] as number || 0), 0),
        fill: COLORS[(index + 2) % COLORS.length], // Shift colors
    }));

    const kategoriData = [
        { name: 'Wira', value: data.filter(row => row.kategori === 'Wira').length },
        { name: 'Madya', value: data.filter(row => row.kategori === 'Madya').length },
    ];

    // --- Data untuk Loading Skeletons ---
    const renderSkeletons = (count: number, heightClass = "h-40") => (
        Array(count).fill(0).map((_, i) => (
            <Skeleton key={i} className={`${heightClass} w-full bg-slate-200 dark:bg-slate-700 rounded-2xl`} />
        ))
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-8 font-sans">
            <motion.div 
                className="max-w-7xl mx-auto space-y-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* --- Header --- */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-15 gap-4 mb-6">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#B8860B] bg-clip-text text-transparent">
                            Dashboard Statistik P3K 2025
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
                           Pantau pendaftaran dan partisipasi secara *real-time*.
                        </p>
                    </div>
                    <Button
                        onClick={fetchData}
                        disabled={loading}
                        variant="outline"
                        className="flex items-center gap-2 px-5 py-3 rounded-full text-base bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        <span>{loading ? 'Memuat...' : 'Refresh Data'}</span>
                    </Button>
                </div>

                {/* --- Kartu Statistik Utama --- */}
                <motion.div 
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    {loading ? renderSkeletons(4) : (
                        <>
                            <StatCard
                                title="Total Pendapatan"
                                value={new Intl.NumberFormat('id-ID', {
                                    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
                                }).format(totalIncome)}
                                icon={<DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
                                color="emerald"
                            />
                            <StatCard
                                title="Total Sekolah Mendaftar"
                                value={totalSchools}
                                icon={<Home className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                                color="indigo"
                            />
                             <StatCard
                                title="Total Tim Terdaftar"
                                value={totalTim}
                                icon={<Users2 className="w-6 h-6 text-amber-600 dark:text-amber-400" />}
                                color="amber"
                            />
                            <StatCard
                                title="Total Peserta"
                                value={totalParticipants.toLocaleString('id-ID')}
                                icon={<Users className="w-6 h-6 text-pink-600 dark:text-pink-400" />}
                                color="pink"
                            />
                        </>
                    )}
                </motion.div>

                {/* --- Grid Chart --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Peserta per Lomba */}
                    <div className="lg:col-span-2">
                       <ChartCard title="Peserta per Mata Lomba" icon={<BarChart3 className="w-6 h-6 text-indigo-500" />}>
                            {loading ? <Skeleton className="h-full w-full rounded-xl bg-slate-200 dark:bg-slate-700" /> : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={pesertaPerLombaData} margin={{ top: 5, right: 20, left: -10, bottom: 40 }}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                                        <XAxis 
                                            dataKey="name" 
                                            angle={-45} // Miringkan label
                                            textAnchor="end" // Rata kanan
                                            interval={0} // Tampilkan semua label
                                            tick={{ fill: 'currentColor', className: 'text-xs text-slate-600 dark:text-slate-400' }}
                                            stroke="currentColor" className="text-slate-600 dark:text-slate-400"
                                        />
                                        <YAxis 
                                             tick={{ fill: 'currentColor', className: 'text-xs text-slate-600 dark:text-slate-400' }}
                                             stroke="currentColor" className="text-slate-600 dark:text-slate-400"
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
                                            contentStyle={{
                                                background: 'rgba(255, 255, 255, 0.8)',
                                                backdropFilter: 'blur(5px)',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '12px',
                                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                                                color: '#0f172a',
                                                padding: '10px 15px'
                                            }}
                                            labelStyle={{ fontWeight: 'bold', marginBottom: '5px' }}
                                            itemStyle={{ padding: '2px 0' }}
                                        />
                                        <Bar dataKey="value" name="Jumlah Peserta" radius={[8, 8, 0, 0]}>
                                          {pesertaPerLombaData.map((entry, index) => (
                                              <Cell key={`cell-${index}`} fill={entry.fill} />
                                          ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                       </ChartCard>
                    </div>

                    {/* Kategori Sekolah */}
                    <div>
                        <ChartCard title="Kategori Sekolah" icon={<PieIcon className="w-6 h-6 text-emerald-500" />}>
                            {loading ? <Skeleton className="h-full w-full rounded-xl bg-slate-200 dark:bg-slate-700" /> : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={kategoriData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={110}
                                            innerRadius={70} // Membuatnya jadi Donut Chart
                                            paddingAngle={5}
                                            label={({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
                                                const RADIAN = Math.PI / 180;
                                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                                const x  = cx + radius * Math.cos(-midAngle * RADIAN);
                                                const y = cy  + radius * Math.sin(-midAngle * RADIAN);
                                                return (
                                                    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="font-bold text-lg">
                                                        {value}
                                                    </text>
                                                );
                                            }}
                                            labelLine={false}
                                        >
                                            {kategoriData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="stroke-white dark:stroke-slate-800" strokeWidth={3} />
                                            ))}
                                        </Pie>
                                        <Legend 
                                           iconType="circle"
                                           wrapperStyle={{ marginTop: '20px', color: 'currentColor' }}
                                           formatter={(value, entry) => (
                                              <span className="text-slate-600 dark:text-slate-300 ml-1">
                                                  {value} ({entry.payload?.value ?? 0}) {/* <-- Gunakan ?. dan ?? */}
                                              </span>
                                          )}
                                        />
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </ChartCard>
                    </div>
                </div>

                 {/* --- Grid Chart Baru (Tim per Lomba) --- */}
                 <div className="grid grid-cols-1 gap-6">
                    <ChartCard title="Tim per Mata Lomba" icon={<Trophy className="w-6 h-6 text-amber-500" />}>
                        {loading ? <Skeleton className="h-full w-full rounded-xl bg-slate-200 dark:bg-slate-700" /> : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={timPerLombaData} margin={{ top: 5, right: 20, left: -10, bottom: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                                    <XAxis 
                                        dataKey="name" 
                                        angle={-45}
                                        textAnchor="end"
                                        interval={0}
                                        tick={{ fill: 'currentColor', className: 'text-xs text-slate-600 dark:text-slate-400' }}
                                        stroke="currentColor" className="text-slate-600 dark:text-slate-400"
                                    />
                                    <YAxis 
                                        allowDecimals={false} // Pastikan Y Axis integer
                                        tick={{ fill: 'currentColor', className: 'text-xs text-slate-600 dark:text-slate-400' }}
                                        stroke="currentColor" className="text-slate-600 dark:text-slate-400"
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
                                        contentStyle={{
                                            background: 'rgba(255, 255, 255, 0.8)',
                                            backdropFilter: 'blur(5px)',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '12px',
                                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                                            color: '#0f172a'
                                        }}
                                        labelStyle={{ fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="value" name="Jumlah Tim" radius={[8, 8, 0, 0]}>
                                        {timPerLombaData.map((entry, index) => (
                                            <Cell key={`cell-tim-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </ChartCard>
                </div>

            </motion.div>

            {/* --- Toast Container (Sama) --- */}
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