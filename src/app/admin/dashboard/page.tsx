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
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-semibold mb-6 text-center text-gray-800">Dashboard Admin</h1>

      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Cari sekolah..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white w-60"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          >
            <option value="">Semua Kategori</option>
            <option value="Madya">Madya</option>
            <option value="Wira">Wira</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={refetch}>🔄 Refresh</Button>
          <Button variant="outline" size="sm" onClick={handleExport}>📤 Export Excel</Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>🖨️ Print</Button>
          <Button variant="default" size="sm" onClick={() => { setFormParticipant(null); setFormOpen(true); }}>
            ➕ Tambah Data
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredData.length === 0 ? (
        <p className="text-center text-gray-500">Tidak ada data pendaftar.</p>
      ) : (
        <div className="overflow-x-auto">
         <table className="min-w-full text-sm text-gray-700">
            <thead className="sticky top-0 bg-white border-b border-gray-200 z-10">
              <tr className="text-left text-gray-600 text-xs uppercase tracking-wider">
                <th className="px-4 py-3">Sekolah</th>
                <th className="px-4 py-3">Pembina</th>
                <th className="px-4 py-3">Whatsapp</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Tandu Putra</th>
                <th className="px-4 py-3">Tandu Putri</th>
                <th className="px-4 py-3">Pertolongan Pertama</th>
                <th className="px-4 py-3">Senam Poco Poco</th>
                <th className="px-4 py-3">Mojang Jajaka</th>
                <th className="px-4 py-3">Poster</th>
                <th className="px-4 py-3">PMR Cerdas</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3 no-print">Bukti</th>
                <th className="px-4 py-3 no-print">Kwitansi</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Nama Pengirim</th>
                <th className="px-4 py-3 no-print">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row) => (
                <tr key={row.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{row.nama_sekolah}</td>
                  <td className="px-4 py-2">{row.pembina}</td>
                  <td className="px-4 py-2">
                    <a
                      href={`https://wa.me/+62${row.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {row.whatsapp}
                    </a>
                  </td>
                  <td className="px-4 py-2">{row.kategori}</td>
                  <td className="px-4 py-2">{row.tandu_putra}</td>
                  <td className="px-4 py-2">{row.tandu_putri}</td>
                  <td className="px-4 py-2">{row.pertolongan_pertama}</td>
                  <td className="px-4 py-2">{row.senam_poco_poco}</td>
                  <td className="px-4 py-2">{row.mojang_jajaka}</td>
                  <td className="px-4 py-2">{row.poster}</td>
                  <td className="px-4 py-2">{row.pmr_cerdas}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">Rp {row.total.toLocaleString("id-ID")}</td>
                  <td className="px-4 py-2 no-print">
                    <a href={row.bukti} className="text-blue-600 underline" target="_blank">Lihat</a>
                  </td>
                  <td className="px-4 py-2 no-print">
                    <a href={row.kwitansi_url} className="text-blue-600 underline" target="_blank">Lihat</a>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                        row.status_verifikasi === "verified"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                      onClick={() => handleToggleStatus(row.id, row.status_verifikasi)}
                    >
                      {row.status_verifikasi === "verified" ? "Telah Diverifikasi" : "Menunggu Verifikasi"}
                    </span>
                  </td>
                  <td className="px-4 py-2">{row.nama_pengirim}</td>
                  <td className="px-4 py-2 flex flex-wrap gap-1 no-print">
                    <Button variant="outline" size="sm" onClick={() => setSelectedParticipant(row)}>🔍 Detail</Button>
                    <Button variant="outline" size="sm" onClick={() => { setFormParticipant(row); setFormOpen(true); }}>✏️ Edit</Button>
                    <Button variant="outline" size="sm" color="red" onClick={() => handleDelete(row.id)}>🗑️ Hapus</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between mt-6">
        <p className="text-sm text-gray-600">Halaman {currentPage} dari {totalPages}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}>Sebelumnya</Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}>Berikutnya</Button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/admin/participants"><Button>Lihat Peserta</Button></Link>
        <Link href="/admin/statistik"><Button>Lihat Statistik</Button></Link>
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
