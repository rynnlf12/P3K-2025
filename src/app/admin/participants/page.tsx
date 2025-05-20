'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';

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

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [newName, setNewName] = useState('');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchParticipants();
  }, []);

  useEffect(() => {
    if (isModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isModalOpen]);

  // Close modal on ESC key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeModal();
      }
    }
    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Filter participants based on searchQuery
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredParticipants(participants);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredParticipants(
        participants.filter(
          (p) =>
            p.nama_sekolah.toLowerCase().includes(q) ||
            p.data_peserta.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, participants]);

  async function fetchParticipants() {
    setLoading(true);
    const { data, error } = await supabase.from('peserta').select('*');
    if (error) {
      console.error('Fetch error:', error.message);
    } else {
      setParticipants(data || []);
      setFilteredParticipants(data || []);
    }
    setLoading(false);
  }

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
    if (!editingParticipant || !newName.trim()) return;

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
          p.id === editingParticipant.id ? { ...p, data_peserta: newName.trim() } : p
        )
      );
      closeModal();
    }
  };

  // Export ke Excel
  const handleExport = () => {
    const formattedData = filteredParticipants.map((participant) => ({
      'Nama Sekolah': participant.nama_sekolah,
      'Nama Peserta': participant.data_peserta,
      'Lomba': participant.lomba,
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Peserta');
    XLSX.writeFile(wb, 'peserta.xlsx');
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Daftar Peserta</h1>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Cari berdasarkan nama peserta atau sekolah..."
          className="w-full md:max-w-md px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Pencarian peserta atau sekolah"
        />

        <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow-md whitespace-nowrap">
          Export ke Excel
        </Button>
      </div>

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg border border-gray-300">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Memuat data peserta...</div>
        ) : filteredParticipants.length === 0 ? (
          <div className="text-center py-10 text-gray-500">Data peserta tidak ditemukan.</div>
        ) : (
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <tr>
                <th className="px-6 py-3 border">Nama Sekolah</th>
                <th className="px-6 py-3 border">Nama Peserta</th>
                <th className="px-6 py-3 border">Lomba</th>
                <th className="px-6 py-3 border">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.map((p) => (
                <tr key={p.id} className="hover:bg-gray-100 transition-colors">
                  <td className="px-6 py-3 border">{p.nama_sekolah}</td>
                  <td className="px-6 py-3 border">{p.data_peserta}</td>
                  <td className="px-6 py-3 border">{p.lomba}</td>
                  <td className="px-6 py-3 border text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                      onClick={() => openModal(p)}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal with AnimatePresence */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-md z-40"
              onClick={closeModal} // close modal when clicking outside content
            />

            {/* Modal content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.25 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl p-6"
              onClick={(e) => e.stopPropagation()} // prevent closing modal on click inside
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 id="modal-title" className="text-xl font-semibold text-gray-800">
                  Edit Nama Peserta
                </h2>
                <button
                  onClick={closeModal}
                  aria-label="Close modal"
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <input
                ref={inputRef}
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Masukkan nama peserta"
              />

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={closeModal} className="px-4 py-2 rounded">
                  Batal
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow-md"
                  disabled={!newName.trim()}
                >
                  Simpan
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
