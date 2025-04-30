'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    fetch("/api/participants")
      .then((res) => res.json())
      .then((json) => setParticipants(json))
      .catch((err) => console.error("Failed to fetch participants:", err));
  }, []);

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(participants);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Peserta');
    XLSX.writeFile(wb, 'peserta.xlsx');
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Tabel Peserta</h1>
      <Button onClick={handleExport}>Export to Excel</Button>
      <table className="min-w-full table-auto border-collapse border border-black mt-4">
        <thead className="bg-red-300">
          <tr>
            <th className="px-4 py-2 border border-black">Nama Sekolah</th>
            <th className="px-4 py-2 border border-black">Nama Peserta</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((participant: any) => (
            <tr key={participant.id} className="border-t hover:bg-yellow-50">
              <td className="px-4 py-2 border border-black">{participant.nama_sekolah}</td>
              <td className="px-4 py-2 border border-black">{participant.data_peserta}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
