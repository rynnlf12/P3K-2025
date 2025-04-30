'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { CheckIcon, TrashIcon, RefreshIcon } from '@heroicons/react/outline';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import Link from 'next/link';

export const dynamic = "force-dynamic"; // ⬅️ mencegah pre-render di build time
type Pendaftar = {
  id: number;
  nomor: string;
  nama_sekolah: string;
  pembina: string;
  whatsapp: string;
  kategori: string;
  tandu_putra: number;
  tandu_putri: number;
  pertolongan_pertama: number;
  senam_poco_poco: number;
  mojang_jajaka: number;
  poster: number;
  pmr_cerdas: number;
  total: number;
  bukti: string;
  kwitansi_url: string;
  nama_pengirim: string;
  status_verifikasi: string;
  created_at: string;
};

export default function AdminDashboard() {
  const [data, setData] = useState<Pendaftar[]>([]);
  const [filteredData, setFilteredData] = useState<Pendaftar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pendaftaran');
      const result = await response.json();
      if (response.ok) {
        setData(result);
        setFilteredData(result);
      } else {
        console.error('Gagal fetch:', result.error);
      }
    } catch (error) {
      console.error('Gagal fetch:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();

    // Real-time update
    const subscription = supabase
    .channel('pendaftaran')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pendaftaran' }, (payload) => {
      console.log('New row inserted:', payload);
      fetchData(); // Memperbarui data ketika ada data baru
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pendaftaran' }, (payload) => {
      console.log('Row updated:', payload);
      fetchData(); // Memperbarui data ketika ada data yang diupdate
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'pendaftaran' }, (payload) => {
      console.log('Row deleted:', payload);
      fetchData(); // Memperbarui data ketika ada data yang dihapus
    })
    .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let filtered = data;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((pendaftar) =>
        pendaftar.nama_sekolah.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((pendaftar) =>
        pendaftar.kategori === selectedCategory
      );
    }

    setFilteredData(filtered);
  }, [searchTerm, selectedCategory, data]);

  const handleVerifikasi = async (id: number) => {
    try {
      const { error } = await supabase
        .from('pendaftaran')
        .update({ status_verifikasi: 'verified' })
        .eq('id', id);

      if (error) throw error;

      setData(data.map((pendaftar) =>
        pendaftar.id === id ? { ...pendaftar, status_verifikasi: 'verified' } : pendaftar
      ));

      toast.success('✅ Data berhasil diverifikasi!');
    } catch (err: any) {
      toast.error(`❌ Gagal memverifikasi data! Pesan: ${err.message}`);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm('Apakah Anda yakin ingin menghapus data ini?');
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('pendaftaran')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setData((prev) => prev.filter((item) => item.id !== id));
      setFilteredData((prev) => prev.filter((item) => item.id !== id));

      toast.success('✅ Data berhasil dihapus!');
    } catch (err: any) {
      toast.error(`❌ Gagal menghapus: ${err.message}`);
    }
  };

  const refreshData = () => {
    fetchData();
    toast.info('🔄 Data berhasil diperbarui!');
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pendaftar');
    XLSX.writeFile(wb, 'pendaftar.xlsx');
  };

  const handlePrint = () => {
    if (typeof window === 'undefined') return;
  
    const table = document.querySelector('table');
    if (!table) return alert('Tabel tidak ditemukan');
  
    const clonedTable = table.cloneNode(true) as HTMLTableElement;
  
    // Hapus kolom berdasarkan index: sesuaikan urutannya sesuai struktur tabel kamu
    // Misal: kolom ke-13 = bukti, ke-14 = status_verifikasi, ke-15 = aksi
    const removeIndexes = [13, 14, 16, 17]; // Index kolom yang ingin dihapus
  
    for (const row of clonedTable.rows) {
      // Hapus dari index paling belakang agar tidak geser index-nya
      for (const index of [...removeIndexes].sort((a, b) => b - a)) {
        if (row.cells.length > index) {
          row.deleteCell(index);
        }
      }
    }
  
    const content = clonedTable.outerHTML;
  
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert('Gagal membuka jendela print');
  
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Data</title>
          <style>
            @page {
              size: 21cm 33cm landscape;
              margin: 1cm;
            }
            body {
              font-family: sans-serif;
              font-size: 12px;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              border: 1px solid #000;
              padding: 4px;
              text-align: left;
            }
          </style>
        </head>
        <body>
          <h2 style="text-align:center;">Data Pendaftar</h2>
          ${content}
        </body>
      </html>
    `);
  
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
  
  

  // Pagination Logic
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-center">📋 Dashboard Admin</h1>

      <div className="mb-4 flex justify-between space-x-4">
        <input
          type="text"
          placeholder="Cari berdasarkan nama sekolah"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 w-100 h-10 border border-gray-300 rounded-md"
        />
         <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 md:w-100 h-10"
        >
          <option value="">Semua Kategori</option>
          <option value="Madya">Madya</option>
          <option value="Wira">Wira</option>
        </select>

        <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={refreshData} className="flex items-center space-x-2">
        <RefreshIcon className="h-5 w-5 text-blue-500" />
        <span>Refresh</span>
        </Button>
        <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center space-x-2">
        <span>Export to Excel</span>
        </Button>
        <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        className="flex items-center space-x-2"
        >
        🖨️<span>Print</span>
      </Button>

        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-t-4 border-gray-500 rounded-full animate-spin"></div>
        </div>
      ) : filteredData.length === 0 ? (
        <p>Tidak ada data pendaftar.</p>
      ) : (
        <div className="overflow-x-auto border rounded-xl">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-red-300">
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Sekolah</th>
                <th className="px-4 py-2 border">Pembina</th>
                <th className="px-4 py-2 border">WA</th>
                <th className="px-4 py-2 border">Kategori</th>
                <th className="px-4 py-2 border">Tandu Putra</th>
                <th className="px-4 py-2 border">Tandu Putri</th>
                <th className="px-4 py-2 border">Pertolongan Pertama</th>
                <th className="px-4 py-2 border">Senam Poco Poco</th>
                <th className="px-4 py-2 border">Mojang Jajaka</th>
                <th className="px-4 py-2 border">Poster</th>
                <th className="px-4 py-2 border">PMR Cerdas</th>
                <th className="px-4 py-2 border">Total</th>
                <th className="px-4 py-2 border">Bukti</th>
                <th className="px-4 py-2 border">Kwitansi</th>
                <th className="px-4 py-2 border">Nama Pengirim</th>
                <th className="px-4 py-2 border">Status Verifikasi</th>
                <th className="px-4 py-2 border">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row) => (
                <tr key={row.id} className="border-t hover:bg-yellow-50">
                  <td className="px-4 py-2 border">{row.id}</td>
                  <td className="px-4 py-2 border">{row.nama_sekolah}</td>
                  <td className="px-4 py-2 border">{row.pembina}</td>
                  <td className="px-4 py-2 border">{row.whatsapp}</td>
                  <td className="px-4 py-2 border">{row.kategori}</td>
                  <td className="px-4 py-2 border">{row.tandu_putra}</td>
                  <td className="px-4 py-2 border">{row.tandu_putri}</td>
                  <td className="px-4 py-2 border">{row.pertolongan_pertama}</td>
                  <td className="px-4 py-2 border">{row.senam_poco_poco}</td>
                  <td className="px-4 py-2 border">{row.mojang_jajaka}</td>
                  <td className="px-4 py-2 border">{row.poster}</td>
                  <td className="px-4 py-2 border">{row.pmr_cerdas}</td>
                  <td className="px-4 py-2 border">Rp {row.total.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-2 border">
                    <a href={row.bukti} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      Lihat
                    </a>
                  </td>
                  <td className="px-4 py-2 border-b">
                {row.kwitansi_url ? (
                  <a
                    href={row.kwitansi_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500"
                  >
                    Lihat Kwitansi
                  </a>
                ) : (
                  'Belum ada kwitansi'
                )}
              </td>
                  <td className="px-4 py-2 border">{row.nama_pengirim}</td>
                  <td className="px-4 py-2 border">
                    <span className={`text-sm font-bold ${row.status_verifikasi === 'verified' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {row.status_verifikasi}
                    </span>
                  </td>
                  <td className="px-4 py-2 border space-x-2">
                    {row.status_verifikasi !== 'verified' && (
                      <Button variant="outline" size="sm" onClick={() => handleVerifikasi(row.id)}>
                        <CheckIcon className="h-4 w-4 text-green-600" />
                        Verifikasi
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleDelete(row.id)}>
                      <TrashIcon className="h-4 w-4 text-red-600" />
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        <div>
          <span>
            Page {currentPage} of {totalPages}
          </span>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next
          </Button>
        </div>
           {/* Link menuju halaman participants */}
      <Link href="/admin/participants">
        <Button className="mb-4">
          Lihat Tabel Peserta
        </Button>
      </Link>
      </div>
      <ToastContainer />
    </div>
  );
}
