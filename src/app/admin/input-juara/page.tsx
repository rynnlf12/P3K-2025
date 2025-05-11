"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-orange-300 to-pink-300 flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Animated background sparkle */}
      <motion.div
        className="absolute top-10 right-10 text-orange-400 opacity-30"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles size={100} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-5xl p-10 space-y-8"
      >
        <h1 className="text-4xl font-extrabold text-center text-gray-800 tracking-tight">
          ✨ Input Data Juara
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dropdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-medium text-gray-700">Kategori</label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                required
                className="w-full p-3 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-yellow-400"
              >
                <option value="">Pilih Kategori</option>
                {kategoriOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">Mata Lomba</label>
              <select
                value={mataLomba}
                onChange={(e) => setMataLomba(e.target.value)}
                required
                className="w-full p-3 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-pink-300"
              >
                <option value="">Pilih Mata Lomba</option>
                {mataLombaOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Input Sekolah */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {juaraData.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <label className="block text-md font-semibold text-gray-700 mb-1">
                  {item.juaraKe}
                </label>
                <input
                  type="text"
                  value={item.namaSekolah}
                  onChange={(e) => handleChange(index, e.target.value)}
                  placeholder="Nama Sekolah"
                  className="w-full p-3 text-lg rounded-xl border border-gray-300 focus:ring-4 focus:ring-orange-300 focus:outline-none shadow-lg"
                />
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xl font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all"
          >
            🚀 Simpan Data Juara
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
