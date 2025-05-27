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
import { Filter, ListOrdered, Save, Printer, Search, RefreshCw, Users } from 'lucide-react';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger 
} from '@/components/ui/tooltip';

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
      if (isRefresh) toast.success("Data berhasil diperbarui!");
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data.');
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(false); }, []);

  // --- Fungsi Transformasi Data ---
   useEffect(() => {
    if (loading && transformedData.length > 0) return;
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
    const newNomorUrut = value === '' || isNaN(parseInt(value)) ? null : parseInt(value);
    const itemBeingEdited = transformedData.find(item => item.id === id);

    if (!itemBeingEdited) return;

    // Hanya lakukan pengecekan duplikasi jika newNomorUrut adalah angka
    if (newNomorUrut !== null) {
      const isDuplicate = transformedData.some(otherItem =>
        otherItem.id !== id && // Bukan item yang sama yang sedang diedit
        otherItem.lomba_key === itemBeingEdited.lomba_key && // Mata lomba yang sama
        otherItem.nomor_urut === newNomorUrut // Nomor urut yang sama
      );

      if (isDuplicate) {
        toast.error(`Nomor urut ${newNomorUrut} sudah digunakan untuk lomba ${itemBeingEdited.lomba_name}.`);
        // Jangan update state untuk input ini, agar input kembali ke nilai sebelumnya atau tetap kosong
        // Anda bisa memaksa input untuk revert nilainya jika perlu, tapi tidak update state sudah cukup
        return; 
      }
    }

    // Lanjutkan update state jika tidak ada duplikasi atau jika nomor urut di-clear
    setTransformedData(prevData =>
      prevData.map(item => {
        if (item.id === id) {
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
    if (itemsToSave.length === 0) { toast.info("Tidak ada perubahan untuk disimpan."); setSaving(false); return; }
    const dataToUpsert = itemsToSave.map(item => ({ pendaftaran_id: item.pendaftaran_id, lomba_key: item.lomba_key, tim_ke: item.tim_ke, nomor_urut: item.nomor_urut, }));
    try {
      const { error } = await supabase.from('daftar_ulang').upsert(dataToUpsert, { onConflict: 'pendaftaran_id, lomba_key, tim_ke' });
      if (error) throw error; 
      setTransformedData(prev => prev.map(item => ({ ...item, isDirty: false })));
      toast.success("Nomor urut berhasil disimpan!");
      fetchData(false); 
    } catch (error: any) { 
      console.error("Error saving data:", JSON.stringify(error, null, 2)); 
      toast.error(`Gagal menyimpan: ${error?.message || 'Periksa RLS/Koneksi.'}`); 
    } finally { setSaving(false); }
  };

  // --- Logika Filter ---
  const filteredData = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase(); 
    return transformedData.filter(item => (filterKategori === 'Semua' || item.kategori === filterKategori) && (filterLomba === 'Semua' || item.lomba_key === filterLomba) && item.nama_sekolah.toLowerCase().includes(lowerCaseSearchTerm))
      .sort((a, b) => (a.nomor_urut ?? 9999) - (b.nomor_urut ?? 9999) || a.nama_sekolah.localeCompare(b.nama_sekolah) || a.lomba_name.localeCompare(b.lomba_name) || a.tim_ke - b.tim_ke);
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

    printTable.querySelectorAll("tbody tr").forEach(row => {
        const tableRow = row as HTMLTableRowElement; 
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
    <TooltipProvider> 
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <ToastContainer position="bottom-right" theme="colored" autoClose={3000} hideProgressBar />
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Manajemen Daftar Ulang</h1>
            <p className="text-gray-500 mt-1">Kelola nomor urut peserta dan cetak data.</p>
          </div>

          {/* Card Filter & Aksi */}
          <Card className="shadow-sm no-print">
            <CardHeader>
                <CardTitle className="text-lg">Filter & Aksi</CardTitle>
                <CardDescription>Gunakan filter untuk menyaring data dan lakukan aksi.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                {/* Area Filter */}
                <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto">
                    <div className="flex items-center gap-2 text-gray-600">
                        <Filter className="w-5 h-5" />
                        <span className="font-medium">Filter:</span>
                    </div>
                    <Select value={filterKategori} onValueChange={setFilterKategori}>
                        <SelectTrigger className="w-full sm:w-[160px] bg-white"><SelectValue placeholder="Kategori" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Semua">Semua Kategori</SelectItem>
                            <SelectItem value="Wira">Wira</SelectItem>
                            <SelectItem value="Madya">Madya</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filterLomba} onValueChange={setFilterLomba}>
                        <SelectTrigger className="w-full sm:w-[200px] bg-white"><SelectValue placeholder="Mata Lomba" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Semua">Semua Lomba</SelectItem>
                            {lombaKeys.map(key => ( <SelectItem key={key} value={key}>{lombaNames[key]}</SelectItem> ))}
                        </SelectContent>
                    </Select>
                    <div className="relative w-full sm:w-[240px]">
                        <Input
                            type="text"
                            placeholder="Cari Sekolah..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-white" 
                        />
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </div>
                     <Tooltip>
                        <TooltipTrigger asChild>
                             <Button onClick={() => fetchData(true)} variant="outline" size="icon" disabled={loading}>
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Refresh Data</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
                {/* Area Aksi */}
                <div className="flex gap-3 w-full lg:w-auto justify-end pt-4 lg:pt-0">                   
                    <Button onClick={handleSave} disabled={saving || !hasChanges}>
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                    <Button onClick={handlePrint} variant="secondary">
                        <Printer className="mr-2 h-4 w-4" /> Cetak
                    </Button>
                </div>
            </CardContent>
          </Card>


          {/* Card Tabel */}
          <Card className="shadow-sm">
            <CardHeader className='flex flex-row justify-between items-center'>
                <div>
                    <CardTitle>Data Peserta Daftar Ulang</CardTitle>
                    <CardDescription className='mt-1'>
                        {loading 
                            ? "Memuat data..." 
                            : `Menampilkan ${filteredData.length} entri data.`}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <div className="border rounded-md overflow-x-auto">
                    <Table id="daftar-ulang-table">
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                            <TableHead className="w-[50px] text-center"><ListOrdered className="w-4 h-4 inline-block"/></TableHead>
                            <TableHead>Nama Sekolah</TableHead>
                            <TableHead className="w-[120px]">Kategori</TableHead>
                            <TableHead>Mata Lomba</TableHead>
                            <TableHead className="w-[80px] text-center">Tim Ke-</TableHead>
                            <TableHead className="w-[150px] text-center">Nomor Urut</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? renderTableSkeleton() : (
                            filteredData.length > 0 ? filteredData.map((item, index) => (
                                <TableRow key={item.id} className={`hover:bg-gray-50 ${item.isDirty ? 'bg-yellow-50' : ''}`}>
                                <TableCell className="text-center font-medium">{index + 1}</TableCell>
                                <TableCell className="font-medium">{item.nama_sekolah}</TableCell>
                                <TableCell>
                                    <Badge variant={item.kategori === 'Wira' ? 'default' : 'secondary'} className='capitalize'>
                                        {item.kategori}
                                    </Badge>
                                </TableCell>
                                <TableCell>{item.lomba_name}</TableCell>
                                <TableCell className="text-center">{item.tim_ke}</TableCell>
                                <TableCell className="text-center">
                                    <Input
                                    type="number"
                                    value={item.nomor_urut ?? ''}
                                    onChange={(e) => handleNomorUrutChange(item.id, e.target.value)}
                                    className="w-20 text-center mx-auto h-8 no-print border-gray-300 focus:ring-orange-500 focus:border-orange-500" 
                                    min="1"
                                    />
                                    {/* Teks ini akan ditangani oleh handlePrint untuk cloning */}
                                    <span className='hidden print-only-text'>{item.nomor_urut ?? '-'}</span>
                                </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                <TableCell colSpan={6} className="text-center h-48 text-gray-500">
                                    <div className='flex flex-col items-center justify-center'>
                                        <Users className='w-12 h-12 text-gray-300 mb-2'/>
                                        <p>Tidak ada data ditemukan.</p>
                                        <p className='text-xs'>Coba ubah filter atau kata kunci pencarian Anda.</p>
                                    </div>
                                </TableCell>
                                </TableRow>
                            )
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </TooltipProvider>
  );
}