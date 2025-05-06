'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';

type Participant = {
  id: string;
  nama_sekolah: string;
  data_peserta: string;
  lomba: string;
};

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/participants")
      .then((res) => res.json())
      .then((json) => setParticipants(json))
      .catch((err) => console.error("Failed to fetch participants:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = () => {
    const formattedData = participants.map((participant) => ({
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

      <div className="text-center mb-6">
        <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700 text-white">
          Export ke Excel
        </Button>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Memuat data peserta...</div>
        ) : (
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-2 border">Nama Sekolah</th>
                <th className="px-4 py-2 border">Nama Peserta</th>
                <th className="px-4 py-2 border">Lomba</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant) => (
                <tr key={participant.id} className="hover:bg-gray-100">
                  <td className="px-4 py-2 border">{participant.nama_sekolah}</td>
                  <td className="px-4 py-2 border">{participant.data_peserta}</td>
                  <td className="px-4 py-2 border">{participant.lomba}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
