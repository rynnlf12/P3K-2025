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
  Plus,
  FileDown,
  RefreshCw,
  FileText,
  Printer,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { data, loading, refetch } = usePendaftar();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [formParticipant, setFormParticipant] = useState<any>(null);
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
  const originalTable = document.querySelector("table");
  if (!originalTable) return;

  const printTable = originalTable.cloneNode(true) as HTMLTableElement;
  
  const columnsToKeep = [0, 1]; // Sekolah, Pembina
  const competitionColumns = [4, 5, 6, 7, 8, 9, 10]; // Kolom lomba

  // Proses header
  const headerRow = printTable.querySelector("thead tr");
  if (headerRow) {
    const headers = Array.from(headerRow.children);
    
    headers.forEach((th, index) => {
      if (!columnsToKeep.includes(index) && index !== 3) {
        th.remove();
      }
    });
    
    // Tambahkan header Mata Lomba dengan type assertion
    const mataLombaHeader = document.createElement("th");
    mataLombaHeader.textContent = "Mata Lomba";
    headerRow.appendChild(mataLombaHeader);
  }

  // Proses body dengan type checking
  const bodyRows = printTable.querySelectorAll("tbody tr");
  bodyRows.forEach(row => {
    const cells = Array.from(row.children) as HTMLElement[];
    let mataLombaContent = "";
    
    competitionColumns.forEach((colIndex) => {
      const cellContent = cells[colIndex]?.textContent || "";
      const value = parseInt(cellContent, 10) || 0; // Handle NaN case
      
      if (value > 0) {
        const columnName = originalTable.querySelector(
          `th:nth-child(${colIndex + 1})`
        )?.textContent || `Lomba ${colIndex - 3}`; // Fallback name
        
        mataLombaContent += `${columnName}: ${value}\n`;
      }
    });

    cells.forEach((cell, index) => {
      if (!columnsToKeep.includes(index) && index !== 3) {
        cell.remove();
      }
    });

    const mataLombaCell = document.createElement("td");
    mataLombaCell.textContent = mataLombaContent;
    mataLombaCell.style.whiteSpace = "pre-wrap";
    row.appendChild(mataLombaCell);
  });

  // Styling untuk print
  const style = `
    <style>
      body { font-family: sans-serif; padding: 20px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
      th { background-color: #f8f9fa; font-weight: 600; }
      tr:nth-child(even) { background-color: #f9f9f9; }
      .no-print, .actions-column { display: none !important; }
      @media print {
        @page { margin: 10mm; }
        table { font-size: 12px; }
      }
    </style>
  `;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write("<html><head><title>Data Pendaftar</title>");
    printWindow.document.write(style);
    printWindow.document.write("</head><body>");
    printWindow.document.write("<h2 style='text-align:center; margin-bottom:20px;'>Laporan Pendaftaran</h2>");
    printWindow.document.write(printTable.outerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();
    
    // Delay print untuk memastikan konten terload
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }
};

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-9xl">
        {/* Header Section */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl lg:text-4xl">
              Database Pendaftaran
              <span className="ml-2 text-lg text-blue-600 md:text-xl">{filteredData.length} data</span>
            </h1>
          </div>
          <Button 
            variant="gradient" 
            size="sm"
            onClick={() => { setFormParticipant(null); setFormOpen(true); }}
            className="gap-2 shadow-lg transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            Tambah Peserta
          </Button>
        </div>

        {/* Control Panel */}
        <div className="mb-6 rounded-2xl bg-white p-4 shadow-lg md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari sekolah atau pembina..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-xl border-2 border-gray-100 bg-gray-50 p-3 pl-12 text-sm text-gray-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl border-2 border-gray-100 bg-gray-50 p-2.5 text-sm text-gray-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Semua Kategori</option>
                <option value="Madya">Madya</option>
                <option value="Wira">Wira</option>
              </select>
              
              <div className="flex gap-2">
                <TooltipProvider>
                  {[
                    { icon: <RefreshCw />, action: refetch, label: 'Refresh' },
                    { icon: <FileDown />, action: handleExport, label: 'Export Excel' },
                    { icon: <Printer />, action: handlePrint, label: 'Print' },
                  ].map((btn, i) => (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="glass" 
                          size="sm" 
                          onClick={btn.action}
                          className="h-11 w-11 p-0 transition-all hover:scale-105"
                        >
                          {btn.icon}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>{btn.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        {loading ? (
          <div className="space-y-4 rounded-2xl bg-white p-6 shadow-lg">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : filteredData.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
            <div className="mx-auto max-w-md">
              <div className="animate-bounce">
                <svg className="mx-auto h-24 w-24 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Data tidak ditemukan</h3>
              <p className="mt-2 text-sm text-gray-500">Coba gunakan kata kunci atau filter yang berbeda</p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border-2 border-gray-100 bg-white shadow-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <tr>
                    {[
                      'Sekolah', 'Pembina', 'WA', 'Kategori', 
                      'T. Putra', 'T. Putri', 'PP', 'Poco', 'MJ',
                      'Poster', 'PMR', 'Total', 'Bukti', 'Kwitansi',
                      'Status', 'Aksi'
                    ].map((header, i) => (
                      <th key={i} className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedData.map((row) => (
                    <tr key={row.id} className="transition-colors hover:bg-gray-50">
                      {/* Sel tabel diperbarui dengan styling modern */}
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        <span className="truncate hover:text-clip">{row.nama_sekolah}</span>
                      </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 max-w-[100px] truncate">
                        {row.pembina}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                        <a 
                          href={`https://wa.me/+62${row.whatsapp}`} 
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {row.whatsapp}
                        </a>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          row.kategori === "Madya" 
                            ? "bg-purple-100 text-purple-800" 
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {row.kategori}
                        </span>
                      </td>

                      {/* Numeric columns */}
                      {[
                        row.tandu_putra,
                        row.tandu_putri,
                        row.pertolongan_pertama,
                        row.senam_poco_poco,
                        row.mojang_jajaka,
                        row.poster,
                        row.pmr_cerdas
                      ].map((val, idx) => (
                        <td key={idx} className="whitespace-nowrap px-3 py-3 text-center text-sm text-gray-500">
                          {val}
                        </td>
                      ))}

                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                        Rp{row.total?.toLocaleString("id-ID")}
                      </td>

                      {/* Document columns */}
                      <td className="whitespace-nowrap px-2 py-3 text-center text-sm no-print">
                        {row.bukti && (
                          <a 
                            href={row.bukti} 
                            className="inline-flex items-center text-blue-600 hover:text-blue-800"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Lihat Bukti"
                          >
                            <FileText className="h-4 w-4" />
                          </a>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-2 py-3 text-center text-sm no-print">
                        {row.kwitansi_url && (
                          <a 
                            href={row.kwitansi_url} 
                            className="inline-flex items-center text-blue-600 hover:text-blue-800"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Lihat Kwitansi"
                          >
                            <FileText className="h-4 w-4" />
                          </a>
                        )}
                      </td>
                      
                      {/* Status dengan animasi */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleStatus(row.id, row.status_verifikasi)}
                          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                            row.status_verifikasi === "verified" 
                              ? "bg-green-100 text-green-800 hover:bg-green-200" 
                              : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          }`}
                        >
                          <span className="relative flex h-2 w-2">
                            {row.status_verifikasi === "verified" && (
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                            )}
                            <span className={`relative inline-flex h-2 w-2 rounded-full ${
                              row.status_verifikasi === "verified" ? "bg-green-500" : "bg-amber-500"
                            }`}></span>
                          </span>
                          {row.status_verifikasi === "verified" ? "Terverifikasi" : "Menunggu"}
                        </button>
                      </td>

                      {/* Action buttons dengan tooltip */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            {[
                              { icon: <Eye />, action: () => setSelectedParticipant(row), color: 'text-blue-600', label: 'Detail' },
                              { icon: <Pencil />, action: () => { setFormParticipant(row); setFormOpen(true); }, color: 'text-green-600', label: 'Edit' },
                              { icon: <Trash2 />, action: () => handleDelete(row.id), color: 'text-red-600', label: 'Hapus' },
                            ].map((btn, i) => (
                              <Tooltip key={i}>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-8 w-8 p-0 hover:scale-110 ${btn.color}`}
                                    onClick={btn.action}
                                  >
                                    {btn.icon}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p>{btn.label}</p>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          </TooltipProvider>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Modern */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl bg-white px-6 py-4 shadow-lg sm:flex-row">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{((currentPage - 1) * itemsPerPage) + 1}</span> - 
            <span className="font-semibold text-gray-900"> {Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of 
            <span className="font-semibold text-gray-900"> {filteredData.length}</span> entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="gap-1 rounded-xl"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i+1}
                variant={currentPage === i+1 ? "default" : "outline"} // Ganti 'solid' dengan 'default'
                size="sm"
                className={`rounded-xl ${currentPage === i+1 ? 'shadow-md' : ''}`}
                onClick={() => setCurrentPage(i+1)}
              >
                {i+1}
              </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="gap-1 rounded-xl"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/admin/participants", label: "Data Peserta" },
            { href: "/admin/statistik", label: "Statistik Pendaftaran" },
            { href: "/admin/input-juara", label: "Input Daftar Juara" },
            { href: "/admin/hasil-upload", label: "Upload Form Penilaian Peserta" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-xl bg-white p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">{link.label}</h3>
                  <p className="text-xs text-gray-500">Lihat detail</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
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