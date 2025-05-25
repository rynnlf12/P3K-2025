'use client';

import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import { LOMBA_LIST } from '@/data/lomba';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Download, 
    CheckCircle, 
    Loader2, 
    AlertTriangle, 
    PartyPopper, 
    FileText,
    Home
} from 'lucide-react';
import Link from 'next/link';

// --- (Tipe Data, getImageBase64, generatePDF tetap SAMA) ---
type DataPendaftaran = {
  sekolah: {
    nama: string;
    pembina: string;
    whatsapp: string;
    kategori: string;
  };
  lombaDipilih: Record<string, number>;
  peserta: Record<string, string[][]>;
  totalBayar: number;
};

const getImageBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject('Canvas not supported');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = (err) => reject(err);
    });
};

interface GeneratedPDF {
    doc: jsPDF;
    blob: Blob;
}

const generatePDF = async (data: {
    nomor: string;
    dataPendaftaran: DataPendaftaran;
}): Promise<GeneratedPDF> => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 20;
    let y = margin;

    try {
        const [logoBase64, stempelBase64] = await Promise.all([
            getImageBase64('/desain-p3k.png'),
            getImageBase64('/Picture1.png')
        ]);

        const pageWidth = doc.internal.pageSize.getWidth();
        
        doc.addImage(logoBase64, 'PNG', margin, y, 40, 25);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('PEKAN PERLOMBAAN PMR (P3K) 2025', margin + 40 + 10, y + 8);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('KSR PMI Unit Universitas Suryakancana', margin + 40 + 10, y + 14);
        doc.text('Jl. Pasir Gede Raya, Cianjur, Jawa Barat', margin + 40 + 10, y + 20);
        
        y += 30;
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('BUKTI PEMBAYARAN RESMI', pageWidth / 2, y, { align: 'center' });
        y += 10;

        const infoColumns = [
            {
                title: 'Informasi Pembayaran',
                content: [
                    `Nomor Kwitansi: ${data.nomor}`,
                    `Tanggal: ${new Date().toLocaleDateString('id-ID')}`,
                    `Metode Pembayaran: Transfer Bank BCA`
                ],
            },
            {
                title: 'Informasi Sekolah',
                content: [
                    `Nama Sekolah: ${data.dataPendaftaran.sekolah.nama}`,
                    `Pembina: ${data.dataPendaftaran.sekolah.pembina}`,
                    `WhatsApp: ${data.dataPendaftaran.sekolah.whatsapp}`
                ],
            }
        ];

        const columnWidth = (pageWidth - margin * 2 - 10) / 2;
        infoColumns.forEach((col, idx) => {
            const x = margin + (columnWidth + 10) * idx;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(col.title, x, y);
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            col.content.forEach((text, i) => {
                doc.text(text, x, y + 8 + (i * 5));
            });
        });
        y += 35;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Detail Perlombaan:', margin, y);
        y += 7;

        const headers = ['Nama Lomba', 'Jumlah Tim', 'Biaya'];
        const rows = Object.entries(data.dataPendaftaran.lombaDipilih).map(([id, jumlah]) => {
            const lomba = LOMBA_LIST.find(l => l.id === id);
            return [
                lomba?.nama || id,
                jumlah.toString(),
                `Rp ${((lomba?.biaya || 0) * jumlah).toLocaleString('id-ID')}`
            ];
        });

        const colWidths = [90, 30, 50];
        const rowHeight = 8;
        
        doc.setFillColor(220, 53, 69);
        doc.setTextColor(255, 255, 255);
        let x = margin;
        headers.forEach((header, i) => {
            doc.rect(x, y, colWidths[i], rowHeight, 'F');
            doc.text(header, x + 3, y + 5);
            x += colWidths[i];
        });
        y += rowHeight;

        doc.setTextColor(0, 0, 0);
        rows.forEach(row => {
            x = margin;
            row.forEach((cell, i) => {
                doc.setFont('helvetica', i === 2 ? 'bold' : 'normal');
                doc.text(cell, x + 3, y + 5);
                doc.rect(x, y, colWidths[i], rowHeight);
                x += colWidths[i];
            });
            y += rowHeight;
        });
        y += 10;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(`Total Pembayaran: Rp ${data.dataPendaftaran.totalBayar.toLocaleString('id-ID')}`, 
            pageWidth - margin, y, { align: 'right' });
        y += 15;

        const stampWidth = 65;
        const stampHeight = 65;
        const stampX = pageWidth - margin - stampWidth;
        const startY = y;
        const dateText = 'Cianjur, ' + new Date().toLocaleDateString('id-ID');
        doc.setFontSize(12);
        const dateX = stampX + (stampWidth/2) - (doc.getTextWidth(dateText)/2);
        doc.text(dateText, dateX, startY);
        const stampY = startY - 15;
        doc.addImage(stempelBase64, 'PNG', stampX, stampY, stampWidth, stampHeight);
        const panitiaText = 'Panitia P3K 2025';
        const panitiaX = stampX + (stampWidth/2) - (doc.getTextWidth(panitiaText)/2);
        const panitiaY = stampY + stampHeight - 9;
        doc.setFont('helvetica', 'bold');
        doc.text(panitiaText, panitiaX, panitiaY);
        y = panitiaY + 5;

        y = doc.internal.pageSize.getHeight() - margin + 5;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        doc.text('Kwitansi ini merupakan bukti pembayaran yang sah, tunjukkan kwitansi ini saat daftar ulang.', pageWidth / 2, y, { align: 'center' });
        doc.text('Contact: ksrunitunsur@gmail.com | Telp: (+628) 5603-1052-34', pageWidth / 2, y + 4, { align: 'center' });

        const blob = doc.output('blob');
        return { doc, blob };
        
    } catch (error) {
        console.error('Gagal generate PDF:', error);
        throw new Error('Gagal membuat dokumen PDF');
    }
};
// --- (Akhir dari kode yang tidak berubah) ---


export default function KwitansiPage() {
  const [data, setData] = useState<{
    nomor: string;
    namaPengirim: string;
    dataPendaftaran: DataPendaftaran;
  } | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = () => {
      try {
        const stored = localStorage.getItem('formPendaftaran');
        const namaPengirim = localStorage.getItem('namaPengirim') || 'Tanpa Nama';

        if (!stored) throw new Error('Data pendaftaran tidak ditemukan');

        const parsed = JSON.parse(stored);
        if (!parsed?.sekolah?.nama) throw new Error('Data tidak valid');

        const now = new Date();
        const offset = 7 * 60 * 60 * 1000;
        const wib = new Date(now.getTime() + offset);
        const pad = (n: number) => String(n).padStart(2, '0');
        const timestamp = `${wib.getFullYear()}${pad(wib.getMonth() + 1)}${pad(wib.getDate())}${pad(wib.getHours())}${pad(wib.getMinutes())}`;
        const nomor = `P3K2025-${parsed.sekolah.nama.replace(/\s+/g, '').toUpperCase().slice(0, 10)}-${timestamp}`;

        setData({
          nomor: nomor,
          namaPengirim,
          dataPendaftaran: parsed,
        });
      } catch (err) {
        console.error('Gagal memuat data:', err);
        setError('Gagal memuat data kwitansi. Silakan coba muat ulang halaman atau hubungi panitia.');
      }
    };

    loadData();
  }, []);

  const handleDownload = async () => {
    if (!data || isDownloading) return;

    setIsDownloading(true);
    setError(null);
    setIsDownloaded(false);

    try {
      const { doc, blob } = await generatePDF(data);
      doc.save(`kwitansi-${data.nomor}.pdf`);

      const filename = `kwitansi-${data.nomor}.pdf`;
      
      // Upload ke Supabase di background
      supabase.storage
        .from('kwitansi')
        .upload(filename, blob, { upsert: true })
        .then(async ({ data: uploadResult, error: uploadError }) => {
          if (uploadError) {
              console.error("Supabase Upload Error:", uploadError);
              setError("Gagal mengunggah kwitansi ke database.");
          } else {
             console.log("Upload Kwitansi Berhasil:", uploadResult);
             const { data: urlData } = supabase.storage
               .from('kwitansi')
               .getPublicUrl(filename);
             
             if (urlData?.publicUrl) {
                console.log("URL Kwitansi Publik:", urlData.publicUrl);

                const { data: updateResult, error: updateError } = await supabase
                  .from('pendaftaran')
                  .update({ kwitansi_url: urlData.publicUrl })
                  .eq('nomor', data.nomor)
                  .select();

                if (updateError) {
                    console.error("Supabase Update Error:", updateError);
                    setError("Kwitansi diunduh, namun gagal menyimpan URL ke database.");
                } else {
                    console.log("Update Database Berhasil:", updateResult);
                }

             } else {
                console.error("Gagal mendapatkan URL Publik Kwitansi.");
                setError("Kwitansi diunduh, namun gagal mendapatkan URL publik.");
             }
          }
        })
        .catch(err => {
            console.error("Error dalam proses Supabase:", err);
            setError("Terjadi kesalahan saat proses upload/update ke database.");
        });

      setIsDownloaded(true);

    } catch (err) {
      console.error('Error:', err);
      setError('Gagal mengunduh atau membuat kwitansi. Silakan coba lagi.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Tampilan Loading
  if (!data && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center text-gray-600 dark:text-gray-300">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-red-600" />
          <h1 className="text-xl font-semibold">Mempersiapkan Kwitansi Anda...</h1>
          <p className="text-sm">Mohon tunggu sebentar.</p>
        </div>
      </div>
    );
  }

  // Tampilan Error
  if (error && !isDownloaded) { // Hanya tampilkan error utama jika belum terunduh
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-gray-900 p-4">
        <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full shadow-2xl text-center border-t-4 border-red-500"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
        >
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-5" />
          <h1 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Terjadi Kesalahan</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-red-700 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center mx-auto"
          >
            Coba Lagi
          </button>
        </motion.div>
      </div>
    );
  }

  // Tampilan Utama (Sukses)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-yellow-50 via-red-50 to-red-100 dark:from-gray-900 dark:via-red-900/50 dark:to-gray-900">
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-10 max-w-lg w-full shadow-2xl text-center relative overflow-hidden"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <PartyPopper className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
          Pembayaran Berhasil!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Kwitansi Anda siap untuk diunduh. Terima kasih telah mendaftar!
        </p>
        <motion.div 
            className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-8 border border-gray-200 dark:border-gray-600 shadow-inner flex flex-col items-center"
            whileHover={{ scale: 1.02 }}
        >
            <FileText className="w-20 h-20 text-red-500 mb-4" />
            <p className="font-mono text-xs text-gray-500 dark:text-gray-400">
                {data?.nomor}.pdf
            </p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                Bukti Pembayaran P3K 2025
            </p>
        </motion.div>
        
        <motion.button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full bg-gradient-to-r from-yellow-600 to-red-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center text-lg disabled:opacity-60 disabled:cursor-wait"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
          {isDownloading ? (
            <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                Mengunduh...
            </>
          ) : (
             <>
                <Download className="w-5 h-5 mr-3" />
                Download Kwitansi (PDF)
            </>
          )}
        </motion.button>

        <AnimatePresence>
            {isDownloaded && (
                <motion.div 
                    className="mt-6 text-green-600 flex items-center justify-center bg-green-50 dark:bg-green-900/30 p-3 rounded-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                >
                    <CheckCircle className="w-5 h-5 mr-2" /> 
                    Kwitansi berhasil diunduh!
                </motion.div>
            )}
            {error && isDownloaded && ( // Tampilkan error Supabase jika unduh sudah berhasil
                 <motion.div 
                    className="mt-4 text-orange-600 flex items-center justify-center bg-orange-50 dark:bg-orange-900/30 p-3 rounded-lg text-xs"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                >
                    <AlertTriangle className="w-4 h-4 mr-2" /> 
                    {error} (Silakan hubungi panitia jika URL tidak muncul di admin).
                </motion.div>
            )}
        </AnimatePresence>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
            Penting: Simpan dan tunjukkan kwitansi ini saat daftar ulang.
        </p>

        {isDownloaded && (
             <Link 
                href="/" 
                className="mt-4 inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
             >
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center"
                >
                    <Home className="w-4 h-4 mr-1" />
                    Kembali ke Beranda
                </motion.span>
             </Link>
        )}
      </motion.div>
       <p className="text-xs text-gray-400 dark:text-gray-600 mt-4">
            KSR PMI Unit Universitas Suryakancana &copy; 2025
        </p>
    </div>
  );
}