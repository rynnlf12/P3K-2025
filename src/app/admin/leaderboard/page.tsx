"use client";

import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { 
    RefreshCw, 
    Search, 
    ChevronDown, 
    Trophy, 
    School, 
    Users, 
    Award, 
    Medal, // Untuk Top  // Untuk loading
    ServerCrash // Untuk error
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { motion, AnimatePresence } from 'framer-motion'; // Impor Framer Motion

// --- (Interface Juara & SchoolRanking tetap sama) ---
interface Juara {
  mata_lomba: string;
  nama_sekolah: string;
  juara_ke: string;
  kategori: string;
}

interface SchoolRanking {
  nama_sekolah: string;
  total_juara_1: number;
  total_juara_2: number;
  total_juara_3: number;
  kategori: string;
}

// --- (Konstanta JUARA_ORDER & fungsi normalizeSchoolName tetap sama) ---
const JUARA_ORDER = ["Juara 1", "Juara 2", "Juara 3", "Harapan 1", "Harapan 2", "Harapan 3"];

const normalizeSchoolName = (name: string): string => {
  return name
    .toUpperCase()
    .replace(/smk\s?negeri\s?/gi, "SMK ")
    .replace(/\s+/g, " ")
    .trim();
};

// Varian Animasi untuk Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Komponen StatCard yang Ditingkatkan
const StatCard = ({ label, value, icon: Icon }: { label: string; value: number | string; icon: React.ElementType }) => (
  <motion.div 
    className="p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg flex items-center gap-4 transition-all hover:border-amber-400/30 hover:shadow-amber-500/5 hover:scale-105"
    variants={itemVariants}
  >
    <div className="w-12 h-12 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-400">
        <Icon className="w-6 h-6" />
    </div>
    <div>
        <div className="text-sm text-amber-300/80">{label}</div>
        <div className="text-3xl font-bold text-white mt-1">{value}</div>
    </div>
  </motion.div>
);

// Komponen RankingCard yang Ditingkatkan
const RankingCard = ({ school, rank }: { school: SchoolRanking; rank: number }) => {
    const rankColors: { [key: number]: string } = {
        1: 'border-amber-400 bg-amber-900/20 shadow-amber-500/10',
        2: 'border-gray-400 bg-gray-700/20 shadow-gray-500/10',
        3: 'border-orange-600 bg-orange-900/20 shadow-orange-600/10',
    };
    const rankIconColors: { [key: number]: string } = {
        1: 'text-amber-400',
        2: 'text-gray-400',
        3: 'text-orange-600',
    };

    const isTop3 = rank <= 3;

    return (
        <motion.div 
            className={`bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:border-amber-400/30 transition-all shadow-md hover:shadow-xl ${rankColors[rank] || 'hover:bg-white/10'}`}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
        >
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${isTop3 ? rankIconColors[rank] : 'text-white bg-white/10'}`}>
                        {isTop3 ? <Medal className="w-6 h-6" /> : rank}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-white truncate" title={school.nama_sekolah}>
                            {school.nama_sekolah}
                        </h3>
                         <p className="text-xs text-gray-400">{school.kategori}</p>
                    </div>
                </div>
                <div className="flex gap-3 md:gap-5 text-center">
                    <div>
                        <div className="text-lg font-bold text-amber-400">{school.total_juara_1}</div>
                        <div className="text-xs text-amber-300/70">🥇</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-gray-300">{school.total_juara_2}</div>
                        <div className="text-xs text-gray-400/70">🥈</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-orange-400">{school.total_juara_3}</div>
                        <div className="text-xs text-orange-500/70">🥉</div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};


// Komponen CompetitionAccordion yang Ditingkatkan
const CompetitionAccordion = ({ title, results, category }: { 
  title: string; 
  results: Juara[]; 
  category: string 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
        className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
        variants={itemVariants}
        layout // Menambahkan animasi layout otomatis
    >
      <button
        className="w-full flex items-center justify-between p-4 hover:bg-white/10 transition-colors focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="text-left flex-1 min-w-0">
          <h3 className="font-semibold text-white text-base truncate">{title}</h3>
          <p className="text-xs text-amber-300/80 mt-1">{category}</p>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-amber-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      
      <AnimatePresence>
          {isOpen && (
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
            >
                <div className="p-4 pt-0 border-t border-white/5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                        {JUARA_ORDER.map((juaraKe) => {
                            const peserta = results.find((j) => j.juara_ke === juaraKe);
                            return (
                                <div
                                    key={juaraKe}
                                    className="p-3 text-sm bg-black/20 rounded-lg border border-white/10 flex items-center gap-3"
                                >
                                    <Trophy className="w-4 h-4 text-amber-300 flex-shrink-0" />
                                    <div>
                                        <div className="font-medium text-amber-300 truncate">{juaraKe}</div>
                                        <div className="text-white truncate text-xs" title={peserta?.nama_sekolah}>
                                            {peserta?.nama_sekolah || "-"}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
          )}
      </AnimatePresence>
    </motion.div>
  );
};

// Komponen Skeleton yang Disesuaikan
const LoadingSkeleton = () => (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
        <Skeleton className="h-12 w-3/4 bg-white/10 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-24 bg-white/10 rounded-2xl" />
            <Skeleton className="h-24 bg-white/10 rounded-2xl" />
        </div>
        <Skeleton className="h-10 w-1/3 bg-white/10 rounded-lg" />
        <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 bg-white/10 rounded-2xl" />
            ))}
        </div>
         <Skeleton className="h-10 w-1/3 bg-white/10 rounded-lg" />
         <Skeleton className="h-12 w-full bg-white/10 rounded-xl" />
         <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-14 bg-white/10 rounded-2xl" />
            ))}
        </div>
    </div>
);


const Leaderboard = () => {
  const [data, setData] = useState<Juara[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Wira"); // Default Wira
  const kategoriList = ["Wira", "Madya"];

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchJuara = async () => {
    setLoading(true);
    try {
      const { data: juaraData, error } = await supabase.from("juara").select("*");
      if (error) throw error;
      setData(juaraData || []);
      setError(null);
    } catch {
      setError('Gagal memuat data. Silakan coba lagi.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchJuara();
  }, []);

  const { schoolRanking } = useMemo(() => {
      const schools: Record<string, SchoolRanking> = {};
      data
        .filter(j => j.kategori === activeCategory)
        .forEach(j => {
            const normalized = normalizeSchoolName(j.nama_sekolah);
            if (!schools[normalized]) {
                schools[normalized] = {
                    nama_sekolah: normalized,
                    total_juara_1: 0,
                    total_juara_2: 0,
                    total_juara_3: 0,
                    kategori: activeCategory,
                };
            }
            if (j.juara_ke === "Juara 1") schools[normalized].total_juara_1++;
            if (j.juara_ke === "Juara 2") schools[normalized].total_juara_2++;
            if (j.juara_ke === "Juara 3") schools[normalized].total_juara_3++;
        });

      const ranking = Object.values(schools).sort((a, b) => {
          if (a.total_juara_1 !== b.total_juara_1) return b.total_juara_1 - a.total_juara_1;
          if (a.total_juara_2 !== b.total_juara_2) return b.total_juara_2 - a.total_juara_2;
          return b.total_juara_3 - a.total_juara_3;
      });

      return { schoolRanking: ranking, totalSchools: Object.keys(schools).length };
  }, [data, activeCategory]);

  const groupedMataLomba = useMemo(() => {
    const result: Record<string, Juara[]> = {};
    data.forEach(j => {
      if (!result[j.mata_lomba]) {
        result[j.mata_lomba] = [];
      }
      result[j.mata_lomba].push(j);
    });
    return result;
  }, [data]);

  const filteredMataLomba = Object.entries(groupedMataLomba).filter(
    ([mataLomba, results]) => 
        mataLomba.toLowerCase().includes(debouncedQuery.toLowerCase()) || 
        results.some(r => r.nama_sekolah.toLowerCase().includes(debouncedQuery.toLowerCase()))
  );

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#501515] to-[#1A0D0D] py-16 sm:py-24 px-4 md:px-8 text-white">
        {/* Efek Bintang (Opsional) */}
        <div className="absolute inset-0 -z-10 opacity-20">
            {/* Anda bisa menambahkan animasi bintang atau partikel di sini */}
        </div>
      <div className="max-w-6xl mx-auto space-y-12">
        <motion.header 
            className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-white/10 pb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-400/10 rounded-full border-2 border-amber-400/30">
                 <Trophy className="h-8 w-8 text-amber-400" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500">
                    Leaderboard P3K
                </h1>
                <p className="text-gray-400 text-sm mt-1">Hasil Perolehan Juara Sementara</p>
              </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/admin/hasil-akhir" // Sesuaikan jika perlu
              className="flex-1 sm:flex-none flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all shadow-lg border border-white/10"
            >
              <School className="w-4 h-4" />
              <span className="truncate">Form Nilai</span>
            </Link>
            <motion.button
              onClick={fetchJuara}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              title="Refresh Data"
            >
              <RefreshCw className="w-5 h-5 text-amber-400" />
            </motion.button>
          </div>
        </motion.header>

        {error && (
          <motion.div 
            className="p-4 text-center text-red-400 bg-red-900/30 rounded-lg border border-red-500/50 flex items-center justify-center gap-3"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            <ServerCrash className="w-5 h-5"/> {error}
          </motion.div>
        )}

        <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={containerVariants} initial="hidden" animate="visible"
        >
          <StatCard label="Total Penghargaan Diraih" value={data.length} icon={Award} />
          <StatCard label="Sekolah Berpartisipasi (Total)" value={new Set(data.map(d => d.nama_sekolah)).size} icon={Users} />
        </motion.div>

        {/* Peringkat Sekolah */}
        <section className="bg-black/20 p-6 rounded-3xl border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-semibold mb-6 text-center text-amber-400">🏆 Peringkat Sekolah 🏆</h2>
            <div className="flex justify-center mb-6 bg-white/5 p-1.5 rounded-full border border-white/10">
                {kategoriList.map((kategori) => (
                    <button
                        key={kategori}
                        onClick={() => setActiveCategory(kategori)}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                            activeCategory === kategori 
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg' 
                            : 'text-gray-300 hover:bg-white/10'
                        }`}
                    >
                        {kategori}
                    </button>
                ))}
            </div>
             <motion.div 
                className="space-y-3"
                key={activeCategory} // Ganti key agar animasi berjalan saat kategori berubah
                variants={containerVariants} initial="hidden" animate="visible"
            >
              {schoolRanking.length > 0 ? schoolRanking.map((school, i) => (
                <RankingCard key={`${school.nama_sekolah}-${i}`} school={school} rank={i + 1} />
              )) : (
                  <div className="text-center py-6 text-gray-400">Belum ada data juara untuk kategori {activeCategory}.</div>
              )}
            </motion.div>
        </section>

        {/* Hasil Per Lomba */}
        <section className="bg-black/20 p-6 rounded-3xl border border-white/10 shadow-2xl">
           <h2 className="text-2xl font-semibold mb-6 text-center text-amber-400">📋 Hasil Per Mata Lomba 📋</h2>
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/70" />
                <input
                    type="text"
                    placeholder="Cari mata lomba atau sekolah..."
                    className="w-full pl-12 pr-4 py-3 text-sm rounded-xl border-2 border-white/20 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <motion.div 
                className="space-y-3"
                variants={containerVariants} initial="hidden" animate="visible"
            >
            {filteredMataLomba.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-sm">
                    Tidak ada mata lomba yang cocok untuk &quot{debouncedQuery}&quot
                </div>
            ) : (
                filteredMataLomba.map(([mata_lomba, juaraList]) => (
                    <CompetitionAccordion
                        key={mata_lomba}
                        title={mata_lomba}
                        results={juaraList}
                        category={juaraList[0]?.kategori || ""}
                    />
                ))
            )}
            </motion.div>
        </section>
        
        <footer className="text-center text-xs text-gray-600 border-t border-white/10 pt-4">
            Papan Skor P3K 2025 - KSR PMI Unit Universitas Suryakancana
        </footer>
      </div>
    </div>
  );
};

export default Leaderboard;