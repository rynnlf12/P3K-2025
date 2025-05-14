"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Trophy, Award, School, Sparkles } from "lucide-react";

const kategoriOptions = ["Wira", "Madya"];
const mataLombaOptions = [
  "Tandu Putra",
  "Tandu Putri",
  "Pertolongan Pertama",
  "Senam Kreasi Poco-Poco",
  "Mojang Jajaka",
  "PMR Cerdas",
  "Poster",
];

export default function InputJuara() {
  const [kategori, setKategori] = useState("");
  const [mataLomba, setMataLomba] = useState("");
  const [juaraData, setJuaraData] = useState(
    [
      "Juara 1",
      "Juara 2",
      "Juara 3",
      "Harapan 1",
      "Harapan 2",
      "Harapan 3",
    ].map((juaraKe) => ({ namaSekolah: "", juaraKe }))
  );

  const handleChange = (index: number, value: string) => {
    const updated = [...juaraData];
    updated[index].namaSekolah = value;
    setJuaraData(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kategori || !mataLomba) {
      alert("Harap pilih kategori dan mata lomba.");
      return;
    }

    const payload = juaraData
      .filter((item) => item.namaSekolah)
      .map((item) => ({
        kategori,
        mata_lomba: mataLomba,
        nama_sekolah: item.namaSekolah,
        juara_ke: item.juaraKe,
      }));

    const { error } = await supabase.from("juara").insert(payload);
    if (error) {
      alert("Gagal simpan: " + error.message);
    } else {
      alert("Data juara berhasil disimpan!");
      setKategori("");
      setMataLomba("");
      setJuaraData(
        juaraData.map((item) => ({ ...item, namaSekolah: "" }))
      );
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#7A1F1F] to-[#3A1C1C] py-28 px-4 flex items-center justify-center relative overflow-hidden">
      {/* Animated background element */}
      <motion.div
        className="absolute top-20 -right-20 text-amber-400/10"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles size={400} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl w-full max-w-4xl p-8 space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 px-6 py-2 rounded-full border border-amber-400/20 mb-4">
            <Trophy className="h-6 w-6 text-amber-400" />
            <span className="text-sm font-medium text-amber-300">P3K 2025</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
            Input Data Juara
          </h1>
          <p className="text-gray-300">Masukkan hasil penilaian final peserta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Dropdown Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block mb-3 font-medium text-amber-300">Kategori</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-400">
                  <School className="h-5 w-5" />
                </div>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-white/20 bg-yellow-600/30 text-amber-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                >
                  <option value="">Pilih Kategori</option>
                  {kategoriOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="group">
              <label className="block mb-3 font-medium text-amber-300">Mata Lomba</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-400">
                  <Award className="h-5 w-5" />
                </div>
                <select
                  value={mataLomba}
                  onChange={(e) => setMataLomba(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-white/20 bg-yellow-600/30 text-amber-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                >
                  <option value="">Pilih Mata Lomba</option>
                  {mataLombaOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Input Sekolah Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {juaraData.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <label className="block mb-2 text-sm font-medium text-amber-300">
                  {item.juaraKe}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={item.namaSekolah}
                    onChange={(e) => handleChange(index, e.target.value)}
                    placeholder="Nama Sekolah"
                    className="w-full pl-4 pr-4 py-3 rounded-xl border-2 border-white/20 bg-white/5 text-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 placeholder-gray-400"
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-amber-600 to-yellow-700 text-lg font-semibold text-white rounded-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            Simpan Data Juara
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}