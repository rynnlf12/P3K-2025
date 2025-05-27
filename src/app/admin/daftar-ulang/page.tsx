'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Filter, ListOrdered, Save, Printer, Search, RefreshCw } from 'lucide-react';

// --- Tipe Data ---
interface Pendaftaran {
  id: string; 
  kategori: string;
  nama_sekolah: string;
  tandu_putra: number;
  tandu_putri: number;
  pertolongan_pertama: number;
  senam_poco_poco: number;
  mojang_jajaka: number;
  poster: number;
  pmr_cerdas: number;
  created_at: string;
}

interface DaftarUlangEntry {
  pendaftaran_id: string; 
  lomba_key: string;
  tim_ke: number;
  nomor_urut: number | null;
}

interface TransformedData {
  id: string; 
  pendaftaran_id: string; 
  nama_sekolah: string;
  kategori: string;
  lomba_key: string;
  lomba_name: string;
  tim_ke: number;
  nomor_urut: number | null;
  isDirty?: boolean; 
}

// --- Nama Lomba ---
const lombaNames: Record<string, string> = {
  tandu_putra: 'Tandu Putra',
  tandu_putri: 'Tandu Putri',
  pertolongan_pertama: 'Pertolongan Pertama',
  senam_poco_poco: 'Senam Poco-Poco',
  mojang_jajaka: 'Mojang Jajaka',
  poster: 'Poster',
  pmr_cerdas: 'PMR Cerdas',
};
const lombaKeys = Object.keys(lombaNames);

// --- Komponen Utama ---
export default function DaftarUlangPage() {
  const [pendaftaranData, setPendaftaranData] = useState<Pendaftaran[]>([]);
  const [daftarUlangData, setDaftarUlangData] = useState<DaftarUlangEntry[]>([]);
  const [transformedData, setTransformedData] = useState<TransformedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterKategori, setFilterKategori] = useState('Semua');
  const [filterLomba, setFilterLomba] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');

  // --- Fungsi Fetch Data ---
  const fetchData = async (isRefresh = false) => {
    setLoading(true);
    try {
      const pendaftarPromise = supabase.from('pendaftaran').select('*').order('nama_sekolah', { ascending: true });
      const ulangPromise = supabase.from('daftar_ulang').select('*');
      const [{ data: pendaftar, error: pendaftarError }, { data: ulang, error: ulangError }] = await Promise.all([pendaftarPromise, ulangPromise]);

      if (pendaftarError) throw pendaftarError;
      if (ulangError) throw ulangError;

      setPendaftaranData(pendaftar as Pendaftaran[]);
      setDaftarUlangData(ulang as DaftarUlangEntry[]);
      if (isRefresh) {
          toast.success("Data berhasil diperbarui!");
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  };

  // --- Efek untuk Fetch Data Awal ---
  useEffect(() => {
    fetchData(false);
  }, []);

  // --- Fungsi Transformasi Data ---
  useEffect(() => {
    // Hanya transform jika data pendaftaran ada
    if (pendaftaranData.length === 0 && !loading) return;

    const newData: TransformedData[] = [];
    pendaftaranData.forEach(sekolah => {
        lombaKeys.forEach(lombaKey => {
            const jumlahTim = sekolah[lombaKey as keyof Pendaftaran] as number;
            if (jumlahTim > 0) {
                for (let i = 1; i <= jumlahTim; i++) {
                    const existingEntry = daftarUlangData.find(du => du.pendaftaran_id === sekolah.id && du.lomba_key === lombaKey && du.tim_ke === i);
                    const currentItem = transformedData.find(t => t.id === `${sekolah.id}-${lombaKey}-${i}`);
                    newData.push({
                        id: `${sekolah.id}-${lombaKey}-${i}`,
                        pendaftaran_id: sekolah.id,
                        nama_sekolah: sekolah.nama_sekolah,
                        kategori: sekolah.kategori,
                        lomba_key: lombaKey,
                        lomba_name: lombaNames[lombaKey],
                        tim_ke: i,
                        nomor_urut: existingEntry ? existingEntry.nomor_urut : null,
                        isDirty: currentItem ? currentItem.isDirty : false,
                    });
                }
            }
        });
    });
    setTransformedData(newData);
  }, [pendaftaranData, daftarUlangData, loading]); 

  // --- Fungsi Handle Input Nomor Urut ---
  const handleNomorUrutChange = (id: string, value: string) => { 
      setTransformedData(prevData =>
      prevData.map(item => {
        if (item.id === id) {
          const newNomorUrut = value === '' || isNaN(parseInt(value)) ? null : parseInt(value);
          const isNowDirty = item.nomor_urut !== newNomorUrut;
          return { ...item, nomor_urut: newNomorUrut, isDirty: item.isDirty || isNowDirty };
        }
        return item;
      })
    );
  };

  // --- Fungsi Simpan Perubahan ---
  const handleSave = async () => { 
    setSaving(true);
    const itemsToSave = transformedData.filter(item => item.isDirty);
    if (itemsToSave.length === 0) {
      toast.info("Tidak ada perubahan untuk disimpan.");
      setSaving(false);
      return;
    }
    const dataToUpsert = itemsToSave.map(item => ({
      pendaftaran_id: item.pendaftaran_id,
      lomba_key: item.lomba_key,
      tim_ke: item.tim_ke,
      nomor_urut: item.nomor_urut,
    }));
    try {
      const { error } = await supabase
        .from('daftar_ulang')
        .upsert(dataToUpsert, { onConflict: 'pendaftaran_id, lomba_key, tim_ke' });
      if (error) throw error; 
      setTransformedData(prev => prev.map(item => ({ ...item, isDirty: false })));
      toast.success("Nomor urut berhasil disimpan!");
      fetchData(false); 
    } catch (error: any) { 
      console.error("Error saving data:", JSON.stringify(error, null, 2)); 
      toast.error(`Gagal menyimpan: ${error?.message || 'Periksa RLS/Koneksi.'}`); 
    } finally {
      setSaving(false);
    }
  };

  // --- Logika Filter ---
  const filteredData = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase(); 

    return transformedData.filter(item => {
      const matchKategori = filterKategori === 'Semua' || item.kategori === filterKategori;
      const matchLomba = filterLomba === 'Semua' || item.lomba_key === filterLomba;
      const matchSearch = item.nama_sekolah.toLowerCase().includes(lowerCaseSearchTerm);

      return matchKategori && matchLomba && matchSearch;
    }).sort((a, b) => (a.nomor_urut ?? 9999) - (b.nomor_urut ?? 9999) || a.nama_sekolah.localeCompare(b.nama_sekolah) || a.lomba_name.localeCompare(b.lomba_name) || a.tim_ke - b.tim_ke);
  }, [transformedData, filterKategori, filterLomba, searchTerm]);

  // --- Handle Print Manual ---
  const handlePrint = () => {
    const tableId = "daftar-ulang-table"; 
    const originalTable = document.getElementById(tableId) as HTMLTableElement;
    if (!originalTable) {
        toast.error("Tabel tidak ditemukan untuk dicetak.");
        return;
    }

    const printTable = originalTable.cloneNode(true) as HTMLTableElement;

    // --- Ubah Input menjadi Teks (Dengan Type Assertion) ---
    printTable.querySelectorAll("tbody tr").forEach(row => {
        const tableRow = row as HTMLTableRowElement; // <-- PERBAIKAN

        if (tableRow.cells && tableRow.cells.length > 0) {
            const inputCell = tableRow.cells[tableRow.cells.length - 1] as HTMLTableCellElement; 
            
            if (inputCell) {
                 const input = inputCell.querySelector("input[type='number']") as HTMLInputElement;
                 if (input) {
                    inputCell.textContent = input.value || '-'; 
                    inputCell.style.textAlign = "center";
                 }
            }
        }
    });
    // ----------------------------------------------------
    
    printTable.querySelectorAll("thead input").forEach(input => input.remove());
    printTable.querySelectorAll(".print-only-text").forEach(span => span.remove());

    const KategoriName = filterKategori === 'Semua' ? 'Semua Kategori' : filterKategori;
    const LombaName = filterLomba === 'Semua' ? 'Semua Lomba' : lombaNames[filterLomba];

    const style = `
      <style>
        body { font-family: 'Arial', sans-serif; padding: 15px; }
        h2, h3 { text-align: center; margin: 5px 0; color: #333; }
        h2 { font-size: 16pt; }
        h3 { font-size: 12pt; font-weight: normal; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #555; padding: 7px; text-align: left; font-size: 9pt; }
        th { background-color: #f0f0f0; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        td:first-child, td:nth-child(5), td:last-child { text-align: center; }
        @media print {
          @page { size: landscape; margin: 15mm; }
          body { padding: 0; }
        }
      </style>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
        printWindow.document.write("<html><head><title>Daftar Ulang P3K 2025</title>");
        printWindow.document.write(style);
        printWindow.document.write("</head><body>");
        printWindow.document.write("<h2>DAFTAR ULANG PESERTA P3K 2025</h2>");
        printWindow.document.write(`<h3>Kategori: ${KategoriName} | Mata Lomba: ${LombaName}</h3>`);
        printWindow.document.write(printTable.outerHTML);
        printWindow.document.write("</body></html>");
        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
            try {
                printWindow.print();
                printWindow.close();
            } catch (e) {
                console.error("Gagal mencetak atau menutup window:", e);
                toast.warn("Window cetak mungkin perlu ditutup manual.");
            }
        }, 500); 
    } else {
        toast.error("Gagal membuka window baru untuk mencetak. Pastikan pop-up tidak diblokir.");
    }
  };


  // --- Render Skeleton ---
  const renderTableSkeleton = () => (
    Array(10).fill(0).map((_, i) => (
      <TableRow key={`skel-${i}`}>
        <TableCell><Skeleton className="h-4 w-6" /></TableCell>
        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-4 w-10" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      </TableRow>
    ))
  );

  const hasChanges = transformedData.some(item => item.isDirty);

  // --- Render Komponen ---
  return (
    <div className="p-4 sm:p-8 bg-slate-50 min-h-screen">
      <ToastContainer position="bottom-right" theme="colored" autoClose={3000} hideProgressBar />
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow-lg">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Daftar Ulang Peserta</h1>
          <p className="text-slate-500">Input nomor urut, cari, perbarui, dan cetak data.</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 p-4 border rounded-lg bg-slate-50 no-print">
          <div className="flex flex-wrap gap-4 items-center">
            <Filter className="w-5 h-5 text-slate-600" />
            <Select value={filterKategori} onValueChange={setFilterKategori}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter Kategori..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Semua">Semua Kategori</SelectItem>
                <SelectItem value="Wira">Wira</SelectItem>
                <SelectItem value="Madya">Madya</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterLomba} onValueChange={setFilterLomba}>
              <SelectTrigger className="w-[220px]"><SelectValue placeholder="Filter Mata Lomba..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Semua">Semua Mata Lomba</SelectItem>
                {lombaKeys.map(key => ( <SelectItem key={key} value={key}>{lombaNames[key]}</SelectItem> ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <Input
                type="text"
                placeholder="Cari Nama Sekolah..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-[250px] pl-10" 
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <Button onClick={() => fetchData(true)} variant="ghost" size="icon" title="Refresh Data" disabled={loading}>
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving || !hasChanges}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
            <Button onClick={handlePrint} variant="outline">
              <Printer className="mr-2 h-4 w-4" /> Cetak
            </Button>
          </div>
        </div>

        <div>
          <div className="border rounded-lg overflow-x-auto">
            <Table id="daftar-ulang-table">
              <TableHeader className="bg-slate-100">
                <TableRow>
                  <TableHead className="w-[50px]"><ListOrdered className="w-4 h-4 inline-block mr-1"/>No</TableHead>
                  <TableHead>Nama Sekolah</TableHead>
                  <TableHead className="w-[100px]">Kategori</TableHead>
                  <TableHead>Mata Lomba</TableHead>
                  <TableHead className="w-[80px]">Tim Ke-</TableHead>
                  <TableHead className="w-[150px]">Nomor Urut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? renderTableSkeleton() : (
                  filteredData.length > 0 ? filteredData.map((item, index) => (
                    <TableRow key={item.id} className={item.isDirty ? 'bg-yellow-100/50' : ''}>
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell className="font-medium">{item.nama_sekolah}</TableCell>
                      <TableCell>{item.kategori}</TableCell>
                      <TableCell>{item.lomba_name}</TableCell>
                      <TableCell className="text-center">{item.tim_ke}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.nomor_urut ?? ''}
                          onChange={(e) => handleNomorUrutChange(item.id, e.target.value)}
                          className="w-24 text-center mx-auto no-print" 
                          min="1"
                        />
                         {/* Teks ini hanya untuk dilihat di layar, akan diganti saat print */}
                        <span className='print-only-text hidden'>{item.nomor_urut ?? '-'}</span>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24 text-slate-500">
                        Tidak ada data yang cocok dengan filter yang dipilih.
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}