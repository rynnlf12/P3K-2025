'use client';

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import DetailModal from "./DetailModal";
import FormModal from "@/components/FormModal";
import { usePendaftar } from "@/hooks/usePendaftar";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { supabase } from "@/lib/supabase";
import {
  Pencil,
  Eye,
  Trash2,
  Loader2,
  Plus,
  FileDown,
  RefreshCw,
  FileText, // <-- Tambahkan ini
} from 'lucide-react';


export default function AdminDashboard() {
  const { data, loading, refetch } = usePendaftar();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [formParticipant, setFormParticipant] = useState<any>(null); // untuk edit
  const [formOpen, setFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pendaftar");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "pendaftar.xlsx");
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "verified" ? "waiting" : "verified";

    const { error } = await supabase
      .from("pendaftaran")
      .update({ status_verifikasi: newStatus })
      .eq("id", id);

    if (error) {
      console.error("Gagal mengubah status:", error.message);
    } else {
      refetch();
    }
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("pendaftaran").delete().eq("id", id);

    if (error) {
      console.error("Gagal menghapus data:", error.message);
    } else {
      refetch();
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearchTerm =
        item.nama_sekolah.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.pembina.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory
        ? item.kategori === selectedCategory
        : true;
      return matchesSearchTerm && matchesCategory;
    });
  }, [data, searchTerm, selectedCategory]);

  const handlePrint = () => {
    const tableElement = document.querySelector("table")?.outerHTML;
    if (!tableElement) return;

    const style = `
      <style>
        body { font-family: sans-serif; padding: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background-color: #f9f9f9; }
        .no-print { display: none; }
      </style>
    `;

    const printWindow = window.open("", "", "width=900,height=600");
    if (printWindow) {
      printWindow.document.write("<html><head><title>Data Pendaftar</title>");
      printWindow.document.write(style);
      printWindow.document.write("</head><body>");
      printWindow.document.write("<h2>Data Pendaftar</h2>");
      printWindow.document.write(tableElement);
      printWindow.document.write("</body></html>");
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  return (
     <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">DATABASE PENDAFTARAN</h1>
    
        </div>

        {/* Control Panel */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Search school..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 rounded-lg border border-gray-200 px-4 py-2 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-10 rounded-lg border border-gray-200 px-4 py-2 text-gray-700 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">All Categories</option>
                <option value="Madya">Madya</option>
                <option value="Wira">Wira</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={refetch} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                <FileDown className="h-4 w-4" />
                Export
              </Button>
               <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                <FileDown className="h-4 w-4" />
                Print
              </Button>
              <Button variant="default" size="sm" onClick={() => { setFormParticipant(null); setFormOpen(true); }}>
                <Plus className="h-4 w-4" />
                Add New
              </Button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        {loading ? (
          <div className="flex h-40 items-center justify-center rounded-lg bg-white">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow-sm">
            No participants found
          </div>
        ) : (
           <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
  <table className="w-full text-xs"> {/* Perkecil ukuran font */}
    <thead className="bg-gray-50">
      <tr className="text-left text-gray-500">
        <th className="px-3 py-2 font-medium">Sekolah</th>
        <th className="px-3 py-2 font-medium">Pembina</th>
        <th className="px-3 py-2 font-medium">WA</th>
        <th className="px-3 py-2 font-medium">Kategori</th>
        <th className="px-3 py-2 font-medium text-center">T. Putra</th>
        <th className="px-3 py-2 font-medium text-center">T. Putri</th>
        <th className="px-3 py-2 font-medium text-center">PP</th>
        <th className="px-3 py-2 font-medium text-center">Poco</th>
        <th className="px-3 py-2 font-medium text-center">MJ</th>
        <th className="px-3 py-2 font-medium text-center">Poster</th>
        <th className="px-3 py-2 font-medium text-center">PMR</th>
        <th className="px-3 py-2 font-medium">Total</th>
        <th className="px-3 py-2 font-medium no-print">Bukti</th>
        <th className="px-3 py-2 font-medium no-print">Kwitansi</th>
        <th className="px-3 py-2 font-medium">Status</th>
        <th className="px-3 py-2 font-medium">Pengirim</th>
        <th className="px-3 py-2 font-medium no-print">Aksi</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {paginatedData.map((row) => (
        <tr key={row.id} className="hover:bg-gray-50">
          {/* Kolom Data */}
          <td className="px-3 py-2 truncate max-w-[120px]">{row.nama_sekolah}</td>
          <td className="px-3 py-2 truncate max-w-[100px]">{row.pembina}</td>
          <td className="px-3 py-2">
            <a href={`https://wa.me/+62${row.whatsapp}`} className="text-blue-600 hover:underline">
              {row.whatsapp}
            </a>
          </td>
          <td className="px-3 py-2">
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
              {row.kategori}
            </span>
          </td>
          
          {/* Kolom Numerik */}
          {[
            row.tandu_putra,
            row.tandu_putri,
            row.pertolongan_pertama,
            row.senam_poco_poco,
            row.mojang_jajaka,
            row.poster,
            row.pmr_cerdas
          ].map((val, idx) => (
            <td key={idx} className="px-3 py-2 text-center">{val}</td>
          ))}

          <td className="px-3 py-2 font-medium">Rp{row.total?.toLocaleString("id-ID")}</td>
          
          {/* Kolom Dokumen */}
          <td className="px-3 py-2 no-print">
            <a href={row.bukti} className="text-blue-600 hover:underline flex items-center gap-1">
              <FileText className="h-3 w-3"/>
            </a>
          </td>
          <td className="px-3 py-2 no-print">
            <a href={row.kwitansi_url} className="text-blue-600 hover:underline flex items-center gap-1">
              <FileText className="h-3 w-3"/>
            </a>
          </td>

          {/* Status */}
          <td className="px-3 py-2">
            <div className="flex items-center gap-1">
              <div className={`h-2 w-2 rounded-full ${row.status_verifikasi === "verified" ? "bg-green-500" : "bg-yellow-500"}`}/>
              <span className="cursor-pointer" onClick={() => handleToggleStatus(row.id, row.status_verifikasi)}>
                {row.status_verifikasi === "verified" ? "✓" : "⌛"}
              </span>
            </div>
          </td>

          <td className="px-3 py-2 truncate max-w-[100px]">{row.nama_pengirim}</td>

          {/* Aksi */}
          <td className="px-3 py-2 no-print">
  <div className="flex items-center gap-1">
    <Button
      variant="ghost"
      size="sm" // Ganti 'xs' dengan 'sm'
      className="h-8 w-8 p-0" // Tambahkan ini untuk ukuran compact
      onClick={() => setSelectedParticipant(row)}
    >
      <Eye className="h-3.5 w-3.5" />
    </Button>
    
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={() => { setFormParticipant(row); setFormOpen(true); }}
    >
      <Pencil className="h-3.5 w-3.5" />
    </Button>
    
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
      onClick={() => handleDelete(row.id)}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  </div>
</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
        )}

        {/* Pagination */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white px-6 py-4 shadow-sm">
          <span className="text-sm text-gray-700">
            Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { href: "/admin/participants", label: "Data Peserta" },
            { href: "/admin/statistik", label: "Statistik Pendaftaran" },
            { href: "/admin/input-juara", label: "Input Daftar Juara" },
            { href: "/admin/leaderboard", label: "Leaderboard Lomba" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg bg-white p-4 text-center shadow-sm transition-all hover:shadow-md"
            >
              <span className="font-medium text-gray-700">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <ToastContainer />
      {selectedParticipant && (
        <DetailModal data={selectedParticipant} open onClose={() => setSelectedParticipant(null)} />
      )}
      {formOpen && (
        <FormModal
          open={formOpen}
          onClose={() => { setFormOpen(false); setFormParticipant(null); }}
          data={formParticipant}
          onSuccess={() => {
            refetch();
            setFormOpen(false);
            setFormParticipant(null);
          }}
        />
      )}
    </div>
  );
}