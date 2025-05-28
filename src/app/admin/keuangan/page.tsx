'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase'; // Sesuaikan path
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
// Popover dan Calendar Dihapus
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  // CalendarIcon Dihapus
  PlusCircle,
  Trash2,
  Loader2,
  Search,
  BookMarked,
  FileDown, // Impor FileDown (jika belum ada dari task sebelumnya)
} from 'lucide-react';
import { format, parseISO } from 'date-fns'; // parseISO ditambahkan
import { id } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import * as XLSX from 'xlsx'; // Impor untuk export Excel
import { saveAs } from 'file-saver'; // Impor untuk export Excel

// Fungsi format Rupiah
const formatRupiah = (number: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};

// Interface untuk transaksi
interface Transaction {
  id: number;
  created_at: string;
  tanggal: string; // Tetap string, karena DB menyimpan sebagai date
  keterangan: string;
  jenis: 'Masuk' | 'Keluar';
  jumlah: number;
  kategori?: string;
}

// State awal, tanggal bisa string format yyyy-MM-dd
const initialFormState = {
  tanggal: format(new Date(), 'yyyy-MM-dd'), // Simpan sebagai string yyyy-MM-dd
  keterangan: '',
  jenis: 'Masuk' as 'Masuk' | 'Keluar',
  jumlah: '',
  kategori: '',
};

export default function HalamanKeuangan() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('keuangan')
      .select('*')
      .order('tanggal', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      setError('Gagal memuat data keuangan.');
      setTransactions([]);
    } else {
      setTransactions(data as Transaction[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'jumlah' ? value.replace(/\D/g, '') : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // handleDateChange sekarang menerima event dari input type="date"
  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, tanggal: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.tanggal || !formData.keterangan || !formData.jumlah || !formData.jenis) {
      setError('Tanggal, Keterangan, Jumlah, dan Jenis wajib diisi.');
      return;
    }

    setSubmitting(true);
    const { error: insertError } = await supabase.from('keuangan').insert([
      {
        tanggal: formData.tanggal, // Langsung gunakan string dari state
        keterangan: formData.keterangan,
        jenis: formData.jenis,
        jumlah: Number(formData.jumlah),
        kategori: formData.kategori || null,
      },
    ]);

    if (insertError) {
      console.error('Error saving transaction:', insertError);
      setError('Gagal menyimpan transaksi.');
    } else {
      setFormData(initialFormState);
      await fetchTransactions();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    // ... (fungsi handleDelete sama seperti sebelumnya) ...
    if (!window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
        return;
    }
    setLoading(true); // Sebaiknya submitting atau state lain untuk delete
    const { error: deleteError } = await supabase
        .from('keuangan')
        .delete()
        .eq('id', id);

    if (deleteError) {
        console.error('Error deleting transaction:', deleteError);
        setError('Gagal menghapus transaksi.');
    } else {
        await fetchTransactions();
    }
    setLoading(false); // Set kembali loading
  };

    const summary = useMemo(() => {
    // ... (fungsi summary sama seperti sebelumnya) ...
    const totalMasuk = transactions
      .filter((t) => t.jenis === 'Masuk')
      .reduce((acc, t) => acc + t.jumlah, 0);
    const totalKeluar = transactions
      .filter((t) => t.jenis === 'Keluar')
      .reduce((acc, t) => acc + t.jumlah, 0);
    return {
      totalMasuk,
      totalKeluar,
      saldo: totalMasuk - totalKeluar,
    };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    // ... (fungsi filteredTransactions sama seperti sebelumnya) ...
      return transactions.filter(t =>
          t.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (t.kategori || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [transactions, searchTerm]);

const handleExport = () => {
    if (filteredTransactions.length === 0) {
        alert("Tidak ada data untuk diekspor.");
        return;
    }

    const dataToExport = filteredTransactions.map(t => ({
        'Tanggal': format(parseISO(t.tanggal), 'dd-MM-yyyy'),
        'Keterangan': t.keterangan,
        'Kategori': t.kategori || '-',
        'Jenis': t.jenis,
        'Jumlah (Rp)': t.jumlah
    }));

    // 2. Tambahkan Ringkasan di bagian bawah
    dataToExport.push(
        // Baris kosong yang sesuai dengan tipe, isi dengan string kosong
        {
            'Tanggal': '',
            'Keterangan': '', // Anda bisa isi spasi ' ' jika ingin ada sel kosong
            'Kategori': '',
            'Jenis': '' as any, // Cast 'as any' agar TS tidak protes jika string kosong bukan bagian dari tipe 'Masuk'|'Keluar'
            'Jumlah (Rp)': '' as any // Cast 'as any' agar TS tidak protes jika string kosong bukan number
        },
        { 'Tanggal': 'TOTAL PEMASUKAN', 'Keterangan': '', 'Kategori': '', 'Jenis': 'Masuk' as any, 'Jumlah (Rp)': summary.totalMasuk },
        { 'Tanggal': 'TOTAL PENGELUARAN', 'Keterangan': '', 'Kategori': '', 'Jenis': 'Keluar' as any, 'Jumlah (Rp)': summary.totalKeluar },
        { 'Tanggal': 'SALDO AKHIR', 'Keterangan': '', 'Kategori': '', 'Jenis': '' as any, 'Jumlah (Rp)': summary.saldo }
    );

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    // Atur lebar kolom (No., Tanggal, Keterangan, Kategori, Jenis, Jumlah)
    // Sesuaikan dengan jumlah kolom yang benar setelah menambahkan 'No.' jika ada
    ws['!cols'] = [ { wch: 12 }, { wch: 40 }, { wch: 20 }, { wch: 10 }, { wch: 15 } ]; // Pastikan jumlah wch sesuai jumlah kolom header
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Keuangan");
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(dataBlob, `laporan_keuangan_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookMarked className="h-8 w-8 text-indigo-600" />
            Manajemen Keuangan
          </h1>
          <p className="text-gray-600 mt-1">Keuangan P3K2025</p>
        </div>

        {/* Ringkasan Keuangan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ... (Card Ringkasan sama) ... */}
            <Card className="shadow-lg border-l-4 border-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
                    <ArrowUpCircle className="h-5 w-5 text-green-500"/>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">{formatRupiah(summary.totalMasuk)}</div>
                </CardContent>
            </Card>
            <Card className="shadow-lg border-l-4 border-red-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
                    <ArrowDownCircle className="h-5 w-5 text-red-500"/>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">{formatRupiah(summary.totalKeluar)}</div>
                </CardContent>
            </Card>
            <Card className="shadow-lg border-l-4 border-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Saldo Akhir</CardTitle>
                    <Banknote className="h-5 w-5 text-blue-500"/>
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${summary.saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {formatRupiah(summary.saldo)}
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Form Input Transaksi */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-gray-700" /> Tambah Transaksi Baru
            </CardTitle>
            <CardDescription>
              Masukkan detail transaksi pemasukan atau pengeluaran.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error!</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kolom Kiri */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tanggal">Tanggal Transaksi</Label>
                    {/* --- INPUT TANGGAL HTML5 --- */}
                    <Input
                      type="date"
                      id="tanggal"
                      name="tanggal"
                      value={formData.tanggal} // Harus format yyyy-MM-dd
                      onChange={handleDateInputChange}
                      required
                      className="mt-1 w-full"
                    />
                    {/* --- AKHIR INPUT TANGGAL HTML5 --- */}
                  </div>
                  <div>
                    <Label htmlFor="keterangan">Keterangan</Label>
                    <Input
                      id="keterangan"
                      name="keterangan"
                      value={formData.keterangan}
                      onChange={handleChange}
                      placeholder="Contoh: Pembelian ATK Lomba"
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
                {/* Kolom Kanan */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="jumlah">Jumlah (Rp)</Label>
                    <Input
                      id="jumlah"
                      name="jumlah"
                      type="text"
                      value={formData.jumlah}
                      onChange={handleChange}
                      placeholder="Contoh: 50000"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="jenis">Jenis Transaksi</Label>
                      <Select
                        value={formData.jenis}
                        onValueChange={(value) => handleSelectChange('jenis', value)}
                        required
                      >
                        <SelectTrigger id="jenis" className="mt-1">
                          <SelectValue placeholder="Pilih Jenis" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Masuk">Uang Masuk</SelectItem>
                          <SelectItem value="Keluar">Uang Keluar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="kategori">Kategori (Opsional)</Label>
                      <Input
                        id="kategori"
                        name="kategori"
                        value={formData.kategori}
                        onChange={handleChange}
                        placeholder="Contoh: Konsumsi"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button type="submit" disabled={submitting} className="w-full md:w-auto">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Transaksi'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Tabel Transaksi */}
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-center flex-wrap gap-4">
                <CardTitle>Daftar Transaksi</CardTitle>
                <Button variant="outline" size="sm" onClick={handleExport} disabled={filteredTransactions.length === 0 || loading}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export Excel
                </Button>
            </div>
             <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Cari keterangan atau kategori..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Masuk (Rp)</TableHead>
                    <TableHead className="text-right">Keluar (Rp)</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-500" />
                        <p className="mt-2 text-gray-500">Memuat data...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                        Tidak ada data transaksi ditemukan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((t) => (
                      <TableRow key={t.id}>
                        {/* Format tanggal dari string yyyy-MM-dd di DB ke dd MMM yyyy */}
                        <TableCell>{format(parseISO(t.tanggal), 'dd MMM yyyy', { locale: id })}</TableCell>
                        <TableCell className="font-medium">{t.keterangan}</TableCell>
                        <TableCell><Badge variant="outline">{t.kategori || '-'}</Badge></TableCell>
                        <TableCell className="text-right text-green-600">
                          {t.jenis === 'Masuk' ? formatRupiah(t.jumlah) : '-'}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          {t.jenis === 'Keluar' ? formatRupiah(t.jumlah) : '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-800 hover:bg-red-100"
                            onClick={() => handleDelete(t.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}