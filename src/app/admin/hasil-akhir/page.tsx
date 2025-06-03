'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Search,
    DownloadCloud,
    Trophy,
    School,
    Filter,
    X,
    ZoomIn,
    FileX2,
    ChevronDown,
    Users, // #NEW: Ikon untuk filter kategori (atau pilih yang lain seperti Award)
} from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/plugins/captions.css";
import { motion } from 'framer-motion';

const lombaList = [
    'Tandu Putra',
    'Tandu Putri',
    'Pertolongan Pertama',
    'Senam Poco Poco',
    'Mojang Jajaka',
    'Poster',
    'PMR Cerdas',
];

interface HasilAkhir {
    id: string;
    mata_lomba: string;
    nama_sekolah: string;
    nomor_urut: string;
    file_path: string;
}

// #NEW: Opsi untuk filter kategori
interface SelectOption {
  value: string;
  label: string;
}

const kategoriFilterOptions: SelectOption[] = [
  { value: 'wira', label: 'Wira (SMA/SMK)' },
  { value: 'madya', label: 'Madya (SMP/MTs)' },
];

// Varian Animasi
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0 }
};

// Komponen Card yang Ditingkatkan
const ResultCard = ({ item, onImageClick, onDownloadClick }: { item: HasilAkhir; onImageClick: (url: string) => void; onDownloadClick: (url: string, filename: string) => void; }) => {
    const imageUrl = supabase.storage
        .from('hasil-akhir')
        .getPublicUrl(item.file_path).data.publicUrl;

    const lombaName = item.mata_lomba.replace(/_/g, ' ');
    const schoolName = item.nama_sekolah.replace(/_/g, ' ');
    const filename = `hasil-${item.mata_lomba}-${item.nama_sekolah}.jpg`;

    return (
        <motion.article
            className="group relative bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-lg transition-all duration-300 hover:shadow-amber-500/10 hover:border-amber-400/30"
            variants={itemVariants}
            layout
        >
            <div className="relative aspect-[4/5] w-full">
                <Image
                    src={imageUrl}
                    alt={`${lombaName} - ${schoolName}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 33vw"
                    priority={false}
                />
                <div
                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-3"
                >
                    <Button
                        size="icon"
                        variant="outline"
                        className="bg-white/10 text-white border-white/20 hover:bg-white/20 rounded-full h-12 w-12"
                        title="Lihat Gambar"
                        onClick={() => onImageClick(imageUrl)}
                    >
                        <ZoomIn className="h-6 w-6" />
                    </Button>
                    <Button
                        size="icon"
                        variant="outline"
                        className="bg-amber-400/10 text-amber-300 border-amber-400/20 hover:bg-amber-400/20 rounded-full h-12 w-12"
                        title="Unduh Gambar"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDownloadClick(imageUrl, filename);
                        }}
                    >
                        <DownloadCloud className="h-6 w-6" />
                    </Button>
                </div>
                <div className="absolute top-3 left-3 bg-black/50 text-white backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm border border-white/20">
                    {item.nomor_urut}
                </div>
            </div>

            <div className="p-4 space-y-1.5 bg-black/10">
                <h3 className="font-semibold text-gray-100 text-sm line-clamp-1" title={lombaName}>
                    {lombaName}
                </h3>
                <div className="flex items-center gap-2 text-xs text-amber-300/80">
                    <School className="h-4 w-4 flex-shrink-0" />
                    <span className="line-clamp-1" title={schoolName}>{schoolName}</span>
                </div>
            </div>
        </motion.article>
    );
};

// Komponen Loading Skeleton
const LoadingGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
            <motion.div
                key={i}
                className="bg-white/5 rounded-2xl border border-white/10 p-4 space-y-3"
                variants={itemVariants}
            >
                <Skeleton className="aspect-[4/5] w-full bg-white/10 rounded-lg" />
                <Skeleton className="h-4 w-3/4 bg-white/10 rounded" />
                <Skeleton className="h-3 w-1/2 bg-white/10 rounded" />
            </motion.div>
        ))}
    </div>
);

// #MODIFIED: CustomSelect component
const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder,
  icon: IconComponent = Filter, // Default icon adalah Filter
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[] | SelectOption[];
  placeholder: string;
  icon?: React.ElementType;
}) => (
    <div className="relative w-full">
        <select
            value={value}
            onChange={onChange}
            className="appearance-none w-full pl-10 pr-8 py-3 text-sm rounded-xl border-2 border-white/20 bg-white/5 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all"
        >
            <option value="" className="bg-gray-800">{placeholder}</option>
            {options.map((option) => {
                if (typeof option === 'string') {
                    return <option key={option} value={option} className="bg-gray-800">{option}</option>;
                }
                return <option key={option.value} value={option.value} className="bg-gray-800">{option.label}</option>;
            })}
        </select>
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-400 pointer-events-none">
            <IconComponent className="h-5 w-5" />
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-amber-400 pointer-events-none">
            <ChevronDown className="h-5 w-5" />
        </div>
    </div>
);

// Komponen Halaman Utama
const HasilAkhirPage = () => {
    const [selectedLomba, setSelectedLomba] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedKategori, setSelectedKategori] = useState(''); // #NEW: State for category filter
    const [hasilAkhirData, setHasilAkhirData] = useState<HasilAkhir[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [openLightbox, setOpenLightbox] = useState(false);
    const [slides, setSlides] = useState<{ src: string; title: string; description: string }[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);
const getKategoriFromNamaSekolah = (namaSekolah: string): 'wira' | 'madya' | '' => {
    if (!namaSekolah || typeof namaSekolah !== 'string') {
        console.log(`getKategori: Input namaSekolah tidak valid: ${namaSekolah}`);
        return '';
    }
    const lowerNamaSekolah = namaSekolah.toLowerCase().trim();
    console.log(`getKategori: Memproses "${namaSekolah}", Menjadi: "${lowerNamaSekolah}"`);

    // #MODIFIED REGEX: Mencari kata kunci yang mungkin diikuti underscore atau sebagai kata utuh
    // atau kita bisa juga mencari awalan seperti sman_, smkn_, smpn_, mtsn_
    if (/^(sma|smk|man|ma)[_\W]?/i.test(lowerNamaSekolah)) { // \W cocok dengan non-word character (termasuk spasi, akhir string), ? artinya opsional
        console.log(`getKategori: Cocok WIRA untuk "${lowerNamaSekolah}"`);
        return 'wira';
    }
    if (/^(smp|mts)[_\W]?/i.test(lowerNamaSekolah)) {
        console.log(`getKategori: Cocok MADYA untuk "${lowerNamaSekolah}"`);
        return 'madya';
    }
    
    // Coba pencocokan yang lebih umum jika formatnya bervariasi (ini lebih longgar)
    // if (lowerNamaSekolah.includes('sma') || lowerNamaSekolah.includes('smk') || lowerNamaSekolah.includes('man') || lowerNamaSekolah.includes('ma')) {
    //     console.log(`getKategori (includes): Cocok WIRA untuk "${lowerNamaSekolah}"`);
    //     return 'wira';
    // }
    // if (lowerNamaSekolah.includes('smp') || lowerNamaSekolah.includes('mts')) {
    //     console.log(`getKategori (includes): Cocok MADYA untuk "${lowerNamaSekolah}"`);
    //     return 'madya';
    // }


    console.log(`getKategori: Tidak ada kecocokan untuk "${lowerNamaSekolah}"`);
    return '';
};

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('hasil_akhir')
                    .select('*')
                    .order('mata_lomba')
                    .order('nomor_urut');

                if (error) throw error;
                setHasilAkhirData(data || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // #MODIFIED: Filter data (termasuk kategori)
    // ... (di dalam komponen HasilAkhirPage)

// ... (kode lainnya tetap sama)

// Filter data
const filteredData = useMemo(() => {
  // Logika filter awal Anda
  const initiallyFiltered = hasilAkhirData.filter((item) => {
    const itemMataLomba = item.mata_lomba.replace(/_/g, ' ');
    const itemNamaSekolah = item.nama_sekolah.toLowerCase();
    const itemKategori = getKategoriFromNamaSekolah(item.nama_sekolah);

    const matchesLomba = selectedLomba ? itemMataLomba === selectedLomba : true;
    const matchesSekolah = searchQuery ? itemNamaSekolah.includes(searchQuery.toLowerCase()) : true;
    const matchesKategori = selectedKategori ? itemKategori === selectedKategori : true;

    return matchesLomba && matchesSekolah && matchesKategori;
  });

  // #NEW: Sortir filteredData berdasarkan mata_lomba lalu nomor_urut secara numerik
  return initiallyFiltered.sort((a, b) => {
    // 1. Urutkan berdasarkan mata_lomba (string comparison)
    // Menggunakan nilai asli dari item, bukan yang sudah di-replace, untuk konsistensi
    if (a.mata_lomba < b.mata_lomba) return -1;
    if (a.mata_lomba > b.mata_lomba) return 1;

    // 2. Jika mata_lomba sama, urutkan berdasarkan nomor_urut (numeric comparison)
    const numA = parseInt(a.nomor_urut, 10);
    const numB = parseInt(b.nomor_urut, 10);

    // Penanganan jika parsing gagal (nomor_urut bukan angka valid atau string kosong)
    // Pindahkan item dengan nomor_urut yang tidak valid/kosong ke akhir.
    if (isNaN(numA) && !isNaN(numB)) return 1;  // numA NaN, numB valid -> numA setelah numB
    if (!isNaN(numA) && isNaN(numB)) return -1; // numA valid, numB NaN -> numA sebelum numB
    if (isNaN(numA) && isNaN(numB)) return 0;  // Keduanya NaN, anggap sama

    return numA - numB; // Urutan ascending
  });
}, [hasilAkhirData, selectedLomba, searchQuery, selectedKategori]); // Dependencies tetap sama

// ... (sisa kode HasilAkhirPage)
    useEffect(() => {
        const newSlides = filteredData.map(item => {
            const imageUrl = supabase.storage
                .from('hasil-akhir')
                .getPublicUrl(item.file_path).data.publicUrl;
            return {
                src: imageUrl,
                title: item.mata_lomba.replace(/_/g, ' '),
                description: `${item.nama_sekolah.replace(/_/g, ' ')} (#${item.nomor_urut})`
            };
        });
        setSlides(newSlides);
    }, [filteredData]);

    const handleDownload = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Network response was not ok.");
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Gagal mengunduh file.");
        }
    };

    const handleImageClick = (imageUrl: string) => {
        const index = slides.findIndex(slide => slide.src === imageUrl);
        if (index > -1) {
            setLightboxIndex(index);
            setOpenLightbox(true);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-[#4A1313] to-[#1A0D0D] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                <motion.div
                    className="mb-12 text-center space-y-3"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-3 bg-amber-400/10 px-6 py-2 rounded-full border border-amber-400/20 mb-4 shadow-lg">
                        <Trophy className="h-6 w-6 text-amber-400" />
                        <span className="text-lg font-semibold text-amber-300">Hasil Penilaian P3K 2025</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent tracking-tight">
                        Galeri Form Penilaian
                    </h1>
                    <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
                        Jelajahi atau cari form penilaian yang telah diunggah oleh juri untuk setiap mata lomba dan sekolah.
                    </p>
                </motion.div>

                <motion.div
                    className="mb-10 bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl p-4 sm:p-6"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-400/70" />
                            <Input
                                placeholder="Cari berdasarkan nama sekolah..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 text-sm rounded-xl border-2 border-white/20 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all"
                            />
                        </div>
                        <CustomSelect
                            value={selectedLomba}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedLomba(e.target.value)}
                            options={lombaList}
                            placeholder="Filter Berdasarkan Lomba"
                            icon={Trophy} // #MODIFIED: Icon spesifik untuk Lomba
                        />
                        {/* #NEW: CustomSelect untuk Kategori */}
                        <CustomSelect
                            value={selectedKategori}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedKategori(e.target.value)}
                            options={kategoriFilterOptions}
                            placeholder="Filter Semua Kategori"
                            icon={Users} // #NEW: Icon untuk Kategori
                        />
                    </div>

                    {/* #MODIFIED: Kondisi untuk menampilkan filter aktif */}
                    {(selectedLomba || searchQuery || selectedKategori) && (
                        <div className="px-1 pt-5 flex flex-wrap gap-3 items-center border-t border-white/10 mt-5">
                            <span className='text-sm text-gray-400'>Filter Aktif:</span>
                            {selectedLomba && (
                                <motion.div
                                    className="bg-amber-400/10 px-3 py-1.5 rounded-full text-xs sm:text-sm flex items-center gap-2 border border-amber-400/20 text-amber-300"
                                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                                >
                                    <Trophy className="h-4 w-4" />
                                    {selectedLomba}
                                    <button
                                        onClick={() => setSelectedLomba('')}
                                        className="text-amber-400 hover:text-white rounded-full bg-white/10 hover:bg-red-500/50 p-0.5"
                                    > <X className="h-3 w-3" /> </button>
                                </motion.div>
                            )}
                            {searchQuery && (
                                <motion.div
                                    className="bg-purple-400/10 px-3 py-1.5 rounded-full text-xs sm:text-sm flex items-center gap-2 border border-purple-400/20 text-purple-300"
                                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                                >
                                    <School className="h-4 w-4" />
                                    &quot;{searchQuery}&quot;
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="text-purple-400 hover:text-white rounded-full bg-white/10 hover:bg-red-500/50 p-0.5"
                                    > <X className="h-3 w-3" /> </button>
                                </motion.div>
                            )}
                            {/* #NEW: Menampilkan filter kategori aktif */}
                            {selectedKategori && (
                                <motion.div
                                    className="bg-teal-400/10 px-3 py-1.5 rounded-full text-xs sm:text-sm flex items-center gap-2 border border-teal-400/20 text-teal-300"
                                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                                >
                                    <Users className="h-4 w-4" />
                                    {kategoriFilterOptions.find(opt => opt.value === selectedKategori)?.label || selectedKategori}
                                    <button
                                        onClick={() => setSelectedKategori('')}
                                        className="text-teal-400 hover:text-white rounded-full bg-white/10 hover:bg-red-500/50 p-0.5"
                                    > <X className="h-3 w-3" /> </button>
                                </motion.div>
                            )}
                        </div>
                    )}
                </motion.div>

                <motion.div
                    // #MODIFIED: Ganti key agar animasi berjalan saat filter kategori juga berubah
                    key={selectedLomba + searchQuery + selectedKategori}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                    {isLoading ? (
                        <LoadingGrid />
                    ) : filteredData.length === 0 ? (
                        <div className="col-span-full text-center py-20">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mx-auto w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border-2 border-white/10 border-dashed"
                            >
                                <FileX2 className="h-12 w-12 text-amber-400/30" />
                            </motion.div>
                            <h2 className="text-2xl font-semibold text-gray-300 mt-6">Oops! Data Tidak Ditemukan</h2>
                            <p className="text-gray-500 text-base mt-2">
                                Tidak ada hasil penilaian yang cocok dengan filter Anda.
                            </p>
                        </div>
                    ) : (
                        filteredData.map((item) => (
                            <ResultCard
                                key={item.id}
                                item={item}
                                onImageClick={handleImageClick}
                                onDownloadClick={handleDownload}
                            />
                        ))
                    )}
                </motion.div>

                <Lightbox
                    open={openLightbox}
                    close={() => setOpenLightbox(false)}
                    slides={slides}
                    index={lightboxIndex}
                    plugins={[Captions]}
                    captions={{
                        showToggle: true,
                        descriptionTextAlign: "center"
                    }}
                    styles={{
                        container: { backgroundColor: 'rgba(10, 5, 5, 0.95)' },
                        captionsDescription: { color: "#ccc" },
                        captionsTitle: { color: "#FFBF00" },
                    }}
                    controller={{
                        closeOnBackdropClick: true,
                    }}
                />
            </div>
        </div>
    );
};

export default HasilAkhirPage;