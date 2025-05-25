'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { 
    Download, 
    Loader2, 
    AlertTriangle, 
    PartyPopper, 
    FileText,
    Home // Mengganti nama ikon Link agar tidak konflik
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function KwitansiContent() {
    const searchParams = useSearchParams();
    const nomor = searchParams?.get('nomor'); // <-- Tambahkan tanda tanya (?)// Ambil 'nomor' dari URL

    const [kwitansiUrl, setKwitansiUrl] = useState<string | null>(null);
    const [namaSekolah, setNamaSekolah] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchKwitansiUrl = async () => {
            if (!nomor) {
                setError('Nomor registrasi tidak ditemukan di URL.');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const { data, error: dbError } = await supabase
                    .from('pendaftaran')
                    .select('kwitansi_url, nama_sekolah')
                    .eq('nomor', nomor)
                    .single(); // Ambil satu baris

                if (dbError) throw new Error("Gagal mengambil data dari database: " + dbError.message);

                if (!data) {
                    setError('Data pendaftaran dengan nomor ini tidak ditemukan.');
                } else if (!data.kwitansi_url) {
                     setError('URL Kwitansi belum tersedia. Mungkin sedang diproses atau terjadi kesalahan sebelumnya. Silakan hubungi panitia.');
                } else {
                    setKwitansiUrl(data.kwitansi_url);
                    setNamaSekolah(data.nama_sekolah || 'Peserta');
                }

            } catch (err: any) {
                console.error("Fetch Kwitansi Error:", err);
                setError(err.message || 'Terjadi kesalahan saat mengambil data kwitansi.');
            } finally {
                setLoading(false);
            }
        };

        fetchKwitansiUrl();
    }, [nomor]);

    // Tampilan Loading
    if (loading) {
        return (
            <div className="text-center text-gray-600 dark:text-gray-300">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-red-600" />
                <h1 className="text-xl font-semibold">Mencari Kwitansi Anda...</h1>
                <p className="text-sm">Mohon tunggu sebentar.</p>
            </div>
        );
    }

    // Tampilan Error
    if (error) {
        return (
            <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full shadow-2xl text-center border-t-4 border-red-500"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-5" />
                <h1 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Terjadi Kesalahan</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">{error}</p>
                 <Link href="/" passHref>
                    <Button variant="outline" className="mt-4">
                        <Home className="w-4 h-4 mr-2" /> Kembali ke Beranda
                    </Button>
                </Link>
            </motion.div>
        );
    }
    
    // Tampilan Sukses
    return (
        <motion.div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-10 max-w-lg w-full shadow-2xl text-center relative overflow-hidden"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
            <PartyPopper className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
                Kwitansi Anda Tersedia!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Terima kasih, {namaSekolah}! Silakan unduh bukti pembayaran Anda.
            </p>
            <motion.div 
                className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-8 border border-gray-200 dark:border-gray-600 shadow-inner flex flex-col items-center"
                whileHover={{ scale: 1.02 }}
            >
                <FileText className="w-20 h-20 text-red-500 mb-4" />
                <p className="font-mono text-xs text-gray-500 dark:text-gray-400">
                    kwitansi-{nomor}.pdf
                </p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                    Bukti Pembayaran P3K 2025
                </p>
            </motion.div>
            
            <a 
                href={kwitansiUrl || '#'} 
                download={`kwitansi-${nomor}.pdf`} // Atribut download
                target="_blank" // Buka di tab baru (baik untuk Supabase URL)
                rel="noopener noreferrer"
                className={`w-full bg-gradient-to-r from-yellow-600 to-red-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center text-lg ${!kwitansiUrl ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
            >
                <Download className="w-5 h-5 mr-3" />
                Download Kwitansi (PDF)
            </a>

             <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
                Penting: Simpan dan tunjukkan kwitansi ini saat daftar ulang.
            </p>

            <Link 
                href="/" 
                className="mt-4 inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
                <Home className="w-4 h-4 mr-1" />
                Kembali ke Beranda
            </Link>
        </motion.div>
    );
}


export default function KwitansiPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-yellow-50 via-red-50 to-red-100 dark:from-gray-900 dark:via-red-900/50 dark:to-gray-900">
            {/* Suspense diperlukan karena useSearchParams butuh waktu untuk render di client */}
            <Suspense fallback={
                <div className="text-center text-gray-600 dark:text-gray-300">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-red-600" />
                    <h1 className="text-xl font-semibold">Memuat Halaman...</h1>
                </div>
            }>
                <KwitansiContent />
            </Suspense>
             <p className="text-xs text-gray-400 dark:text-gray-600 mt-4">
                KSR PMI Unit Universitas Suryakancana &copy; 2025
            </p>
        </div>
    );
}