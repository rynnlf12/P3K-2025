// pages/admin/participants.tsx
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button'; // Sesuaikan dengan komponen Button yang kamu buat
import * as XLSX from 'xlsx';

const ParticipantsPage = () => {
  const [participants, setParticipants] = useState<any[]>([]);

  useEffect(() => {
    // Mengambil data peserta dari Supabase
    const fetchParticipants = async () => {
      const { data, error } = await supabase
        .from('peserta')
        .select('*');

      if (error) {
        console.error('Error fetching participants:', error);
      } else {
        setParticipants(data);
      }
    };

    fetchParticipants();
  }, []);

  // Fungsi untuk mengekspor data ke Excel
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
          {participants.map((participant) => (
            <tr key={participant.id} className="border-t hover:bg-yellow-50">
              <td className="px-4 py-2 border border-black">{participant.nama_sekolah}</td>
              <td className="px-4 py-2 border border-black">{participant.data_peserta}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ParticipantsPage;
