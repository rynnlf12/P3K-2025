"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshIcon, SearchIcon, ChevronDownIcon } from "@/components/Icons"; // TrophyIcon dihapus
import { Skeleton } from "@/components/ui/skeleton";

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

const JUARA_ORDER = ["Juara 1", "Juara 2", "Juara 3", "Harapan 1", "Harapan 2", "Harapan 3"];

const normalizeSchoolName = (name: string): string => {
  return name
    .toUpperCase()
    .replace(/smk\s?negeri\s?/gi, "SMK ")
    .replace(/\s+/g, " ")
    .trim();
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xs border border-gray-100 dark:border-gray-700">
    <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
    <div className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{value}</div>
  </div>
);

const RankingCard = ({ school, rank }: { school: SchoolRanking; rank: number }) => (
  <motion.div
    className="group bg-white dark:bg-gray-800 rounded-xl p-4 shadow-xs hover:shadow-sm transition-shadow border border-gray-100 dark:border-gray-700"
    whileHover={{ y: -2 }}
  >
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
          <span className="text-amber-600 dark:text-amber-400 font-medium">{rank}</span>
        </div>
        <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
          {school.nama_sekolah}
        </h3>
      </div>
      <div className="flex gap-2">
        <div className="text-center">
          <div className="font-semibold text-amber-600 dark:text-amber-400">{school.total_juara_1}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">J1</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-amber-600 dark:text-amber-400">{school.total_juara_2}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">J2</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-amber-600 dark:text-amber-400">{school.total_juara_3}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">J3</div>
        </div>
      </div>
    </div>
  </motion.div>
);

const CompetitionAccordion = ({ title, results, category }: { 
  title: string; 
  results: Juara[]; 
  category: string 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
      <button
        className="w-full flex items-center justify-between p-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="text-left">
          <h3 className="font-medium text-gray-900 dark:text-white text-sm">{title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{category}</p>
        </div>
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 pt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {JUARA_ORDER.map((juaraKe) => {
                  const peserta = results.find((j) => j.juara_ke === juaraKe);
                  return (
                    <div
                      key={juaraKe}
                      className="p-2 text-xs bg-gray-50 dark:bg-gray-700 rounded-md"
                    >
                      <div className="font-medium text-gray-500 dark:text-gray-300">{juaraKe}</div>
                      <div className="text-gray-900 dark:text-white truncate">
                        {peserta?.nama_sekolah || "-"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


const Leaderboard = () => {
  const [data, setData] = useState<Juara[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const kategoriList = ["Wira", "Madya"];
   useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const fetchJuara = async () => {
  try {
    const { data: juaraData, error } = await supabase.from("juara").select("*");
    if (error) throw error;
    setData(juaraData);
    setError(null);
  } catch (err) {
    void(err); // <-- Tambahkan ini
    setError('Gagal memuat data. Silakan coba lagi.');
  }
  setLoading(false);
};

  // Pastikan semua useEffect dipanggil tanpa kondisi
  useEffect(() => {
    fetchJuara();
  }, []);

  const groupBySchool = (kategori: string) => {
    const schools: Record<string, SchoolRanking> = {};
    data
      .filter(j => j.kategori === kategori)
      .forEach(j => {
        const normalized = normalizeSchoolName(j.nama_sekolah);
        if (!schools[normalized]) {
          schools[normalized] = {
            nama_sekolah: normalized,
            total_juara_1: 0,
            total_juara_2: 0,
            total_juara_3: 0,
            kategori,
          };
        }
        if (j.juara_ke === "Juara 1") schools[normalized].total_juara_1++;
        if (j.juara_ke === "Juara 2") schools[normalized].total_juara_2++;
        if (j.juara_ke === "Juara 3") schools[normalized].total_juara_3++;
      });
    return Object.values(schools).sort((a, b) => {
      if (a.total_juara_1 !== b.total_juara_1) return b.total_juara_1 - a.total_juara_1;
      if (a.total_juara_2 !== b.total_juara_2) return b.total_juara_2 - a.total_juara_2;
      return b.total_juara_3 - a.total_juara_3;
    });
  };

  const groupByMataLomba = () => {
    const result: Record<string, Juara[]> = {};
    data.forEach(j => {
      if (!result[j.mata_lomba]) {
        result[j.mata_lomba] = [];
      }
      result[j.mata_lomba].push(j);
    });
    return result;
  };

  const filteredMataLomba = Object.entries(groupByMataLomba()).filter(
    ([mataLomba]) => mataLomba.toLowerCase().includes(debouncedQuery.toLowerCase())
  );

if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 gap-2">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Leaderboard P3K 2025
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Hasil kompetisi real-time
            </p>
          </div>
          <button
            onClick={fetchJuara}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <RefreshIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </header>

        {error && (
          <div className="px-4 py-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Penghargaan" value={data.length} />
          <StatCard label="Sekolah Berpartisipasi" value={Object.keys(groupBySchool("Wira")).length} />
        </div>

        {kategoriList.map((kategori) => (
          <section key={kategori} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-gray-900 dark:text-white">Kategori {kategori}</h2>
              <button
                onClick={() => setExpandedCategory(expandedCategory === kategori ? null : kategori)}
                className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                {expandedCategory === kategori ? 'Sembunyikan' : 'Lihat'}
              </button>
            </div>
            
            <AnimatePresence>
              {expandedCategory === kategori && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  {groupBySchool(kategori).map((school, i) => (
                    <RankingCard key={school.nama_sekolah} school={school} rank={i + 1} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        ))}

        <section className="space-y-4">
          <div className="relative">
            <SearchIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Cari mata lomba..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            {filteredMataLomba.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">
                Tidak ditemukan untuk &quot;{debouncedQuery}&quot; {/* Escape quotes */}
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
          </div>
        </section>
      </div>
    </div>
  );
};

export default Leaderboard;