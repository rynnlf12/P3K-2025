'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import {
  Search,
  FileDown,
  Pencil,
  X,
  Save,
  ArrowUpDown,
  Users,
  ServerCrash,
  ListOrdered, // Ikon untuk nomor urut
} from 'lucide-react';

// Inisialisasi Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Participant = {
  id: string;
  nama_sekolah: string;
  data_peserta: string;
  lomba: string;
};

type SortConfig = {
  key: keyof Participant;
  direction: 'ascending' | 'descending';
} | null;

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(
    null
  );
  const [newName, setNewName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchParticipants();
  }, []);

  useEffect(() => {
    if (isModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    if (isModalOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  async function fetchParticipants() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from('peserta').select('*');
    if (error) {
      console.error('Fetch error:', error.message);
      setError('Gagal memuat data peserta. Silakan coba lagi.');
    } else {
      setParticipants(data || []);
    }
    setLoading(false);
  }

  const sortedAndFilteredParticipants = useMemo(() => {
    let filtered = [...participants];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = participants.filter(
        (p) =>
          p.nama_sekolah.toLowerCase().includes(q) ||
          p.data_peserta.toLowerCase().includes(q) ||
          p.lomba.toLowerCase().includes(q)
      );
    }
    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        if (sortConfig.key === 'nama_sekolah') { // Atau key lain jika diizinkan
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
        }
        return 0;
      });
    }
    return filtered;
  }, [searchQuery, participants, sortConfig]);

  const requestSort = (key: keyof Participant) => {
    // Izinkan sorting untuk semua kolom jika mau, atau batasi seperti sebelumnya
     if (!['nama_sekolah', 'data_peserta', 'lomba'].includes(key as string)) return;

    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const openModal = (participant: Participant) => {
    setEditingParticipant(participant);
    setNewName(participant.data_peserta);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingParticipant(null);
    setNewName('');
  };

  const handleSave = async () => {
    if (!editingParticipant || !newName.trim() || isSaving) return;
    setIsSaving(true);
    const { error } = await supabase
      .from('peserta')
      .update({ data_peserta: newName.trim() })
      .eq('id', editingParticipant.id);
    if (error) {
      console.error('Update error:', error.message);
      alert('Gagal memperbarui nama peserta');
    } else {
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === editingParticipant.id
            ? { ...p, data_peserta: newName.trim() }
            : p
        )
      );
      closeModal();
    }
    setIsSaving(false);
  };

  const handleExport = () => {
    // Tambahkan nomor urut pada data yang akan diekspor
    const formattedData = sortedAndFilteredParticipants.map((participant, index) => ({
      'No.': index + 1, // <-- Nomor urut ditambahkan di sini
      'Nama Sekolah': participant.nama_sekolah,
      'Nama Peserta': participant.data_peserta,
      'Lomba': participant.lomba,
    }));

    if (formattedData.length === 0) {
        alert("Tidak ada data untuk diekspor.");
        return;
    }

    const ws = XLSX.utils.json_to_sheet(formattedData);
    // (Opsional) Atur lebar kolom
    ws['!cols'] = [ {wch:5}, {wch:30}, {wch:30}, {wch:25} ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Peserta');
    XLSX.writeFile(wb, 'daftar_peserta_p3k.xlsx');
  };

  const getSortIcon = (key: keyof Participant) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="h-3 w-3 text-gray-400" />;
    }
    return sortConfig.direction === 'ascending' ?
      <ArrowUpDown className="h-3 w-3 text-white" /> : // Ganti dengan ArrowUp jika mau
      <ArrowUpDown className="h-3 w-3 text-white" />; // Ganti dengan ArrowDown jika mau
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-center mb-8 gap-3">
          <Users className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white text-center">
            Daftar Peserta P3K 2025
          </h1>
        </div>

        {/* Controls */}
        <div className="mb-6 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari peserta, sekolah, atau lomba..."
              className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Pencarian peserta"
            />
          </div>
          <Button
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700 text-white shadow-md transition-all hover:scale-105 gap-2 w-full md:w-auto"
            disabled={sortedAndFilteredParticipants.length === 0 || loading}
          >
            <FileDown className="h-4 w-4" />
            Export Excel
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gradient-to-r from-red-600 to-yellow-500 text-white">
                <tr>
                  {/* --- KOLOM NOMOR BARU --- */}
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider w-16"> {/* Tambah w-16 atau sesuai kebutuhan */}
                    <div className="flex items-center gap-1">
                        <ListOrdered size={14}/> No.
                    </div>
                  </th>
                  {/* --- AKHIR KOLOM NOMOR --- */}
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    <button
                      className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                      onClick={() => requestSort('nama_sekolah')}
                    >
                      Nama Sekolah {getSortIcon('nama_sekolah')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                     <button
                      className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                      onClick={() => requestSort('data_peserta')}
                    >
                        Nama Peserta {getSortIcon('data_peserta')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                     <button
                      className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                      onClick={() => requestSort('lomba')}
                    >
                        Lomba {getSortIcon('lomba')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={`skeleton-${i}`}>
                      <td className="px-4 py-4"><Skeleton className="h-6 w-8 rounded bg-gray-200 dark:bg-gray-700" /></td>
                      <td className="px-6 py-4" colSpan={4}> {/* Sesuaikan colSpan */}
                        <Skeleton className="h-6 w-full rounded bg-gray-200 dark:bg-gray-700" />
                      </td>
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-red-500"> {/* Sesuaikan colSpan */}
                      <ServerCrash className="h-10 w-10 mx-auto mb-2" />
                      {error}
                    </td>
                  </tr>
                ) : sortedAndFilteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400"> {/* Sesuaikan colSpan */}
                      <Search className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                      Tidak ada data peserta yang cocok.
                    </td>
                  </tr>
                ) : (
                  sortedAndFilteredParticipants.map((p, index) => ( // 'index' dari map
                    <motion.tr
                      key={p.id}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                    >
                      {/* --- SEL DATA NOMOR BARU --- */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-600 dark:text-gray-300">
                        {index + 1}
                      </td>
                      {/* --- AKHIR SEL DATA NOMOR --- */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {p.nama_sekolah}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {p.data_peserta}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {p.lomba}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition gap-1"
                          onClick={() => openModal(p)}
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </Button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Modal Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex justify-between items-center mb-6 border-b pb-3 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Pencil className="h-5 w-5 text-blue-600" /> Edit Nama Peserta
                </h2>
                <button
                  onClick={closeModal}
                  aria-label="Tutup"
                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition rounded-full p-1 hover:bg-red-100 dark:hover:bg-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nama Sekolah
                </label>
                <p className="text-gray-900 dark:text-white font-medium bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
                  {editingParticipant?.nama_sekolah}
                </p>
              </div>
              <div className="mb-6">
                <label
                  htmlFor="editName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Nama Peserta Baru
                </label>
                <Input
                  id="editName"
                  ref={inputRef}
                  type="text"
                  className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Masukkan nama peserta baru"
                />
              </div>
              <div className="flex justify-end gap-3 border-t pt-4 dark:border-gray-700">
                <Button variant="outline" onClick={closeModal}>
                  Batal
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white shadow-md gap-2"
                  disabled={!newName.trim() || isSaving}
                >
                  {isSaving ? (
                    <Save className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isSaving ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}