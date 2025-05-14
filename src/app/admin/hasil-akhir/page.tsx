'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Search, DownloadCloud, Trophy, School, Hash, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

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

const HasilAkhirPage = () => {
  const [selectedLomba, setSelectedLomba] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasilAkhirData, setHasilAkhirData] = useState<HasilAkhir[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openLightbox, setOpenLightbox] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('hasil_akhir')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setHasilAkhirData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = hasilAkhirData.filter((item) => {
    const matchesLomba = selectedLomba
      ? item.mata_lomba === selectedLomba.replace(/ /g, '_')
      : true;
      
    const matchesSekolah = searchQuery
      ? item.nama_sekolah
          .toLowerCase()
          .includes(searchQuery.toLowerCase().replace(/ /g, '_'))
      : true;

    return matchesLomba && matchesSekolah;
  });

  const handleDownload = (url: string, filename: string) => {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#7A1F1F] to-[#3A1C1C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        {/* Header Section */}
        <div className="mb-12 md:mb-16 text-center space-y-4 px-2">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-1.5 md:px-6 md:py-2 rounded-full border border-white/10 mb-4 md:mb-6">
            <Trophy className="h-4 w-4 md:h-5 md:w-5 text-yellow-400" />
            <span className="text-xs md:text-sm font-medium text-gray-200">P3K 2025</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#B8860B] md:mb-4 px-4">
            Hasil Penilaian Peserta P3K 2025
          </h1>
          
          <p className="text-sm md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed px-4">
            Berikut ini kami lampirkan hasil penilaian para peserta P3K 2025 dari setiap mata lomba
          </p>
        </div>

        {/* Filter Section */}
        <div className="mb-8 md:mb-12 bg-white/5 backdrop-blur-xl rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/10 shadow-2xl mx-2">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            <div className="flex-1">
              <label className="block text-xs md:text-sm font-medium text-gray-300 mb-1 md:mb-2">
                Cari Berdasarkan Nama Sekolah
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 md:pl-4 text-gray-400">
                  <Search className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <Input
                  placeholder="Cari sekolah..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 md:pl-12 pr-4 py-2 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base border-2 border-white/20 bg-white/5 text-gray-200"
                />
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-xs md:text-sm font-medium text-gray-300 mb-1 md:mb-2">
                Filter Berdasarkan Mata Lomba
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 md:pl-4 text-gray-400">
                  <Filter className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <select
                  value={selectedLomba}
                  onChange={(e) => setSelectedLomba(e.target.value)}
                  className="w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base border-2 border-white/20 bg-white/5 text-gray-200"
                >
                  <option value="">Semua Kategori</option>
                  {lombaList.map((lomba) => (
                    <option key={lomba} value={lomba}>{lomba}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedLomba || searchQuery) && (
            <div className="mt-4 md:mt-6 flex gap-2 md:gap-3 justify-start md:justify-center flex-wrap">
              {selectedLomba && (
                <div className="bg-yellow-500/10 border border-yellow-400/20 text-yellow-300 px-4 py-2 rounded-full text-sm flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  {selectedLomba}
                  <button 
                    onClick={() => setSelectedLomba('')}
                    className="ml-2 text-yellow-400 hover:text-yellow-200 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              {searchQuery && (
                <div className="bg-purple-500/10 border border-purple-400/20 text-purple-300 px-4 py-2 rounded-full text-sm flex items-center gap-2">
                  <School className="h-4 w-4" />
                  {searchQuery}
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="ml-2 text-purple-400 hover:text-purple-200 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 px-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl md:rounded-2xl border border-white/10">
                <div className="aspect-square bg-gray-800 rounded-t-xl md:rounded-t-2xl" />
                <div className="p-3 md:p-4 space-y-2 md:space-y-3">
                  <div className="h-4 md:h-5 bg-gray-700 rounded-full w-3/4" />
                  <div className="h-3 md:h-4 bg-gray-800 rounded-full w-1/2" />
                  <div className="h-3 md:h-4 bg-gray-800 rounded-full w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12 md:py-20 space-y-4 md:space-y-6 px-4">
            <div className="mx-auto w-24 h-24 md:w-32 md:h-32 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
              <Search className="h-12 w-12 md:h-16 md:w-16 text-yellow-400/30" />
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-200">Data Tidak Ditemukan</h2>
            <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto">
              Coba gunakan kata kunci berbeda atau pilih kategori lain
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 px-2">
            {filteredData.map((item) => {
  const imageUrl = supabase.storage
    .from('hasil-akhir')
    .getPublicUrl(item.file_path).data.publicUrl;

  return (
    <article 
      key={item.id}
      className="group bg-white/5 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/10 hover:border-yellow-400/30 transition-all duration-300 md:hover:-translate-y-2 overflow-hidden"
    >
      <div 
        className="relative aspect-square overflow-hidden cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyPress={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter') {
            setSelectedImage(imageUrl);
            setOpenLightbox(true);
          }
        }}
        onClick={() => {
          setSelectedImage(imageUrl);
          setOpenLightbox(true);
        }}
      >
        <Image
          src={imageUrl}
          alt={`${item.mata_lomba.replace(/_/g, ' ')} - ${item.nama_sekolah.replace(/_/g, ' ')}`}
          fill
          className="object-cover transition-transform duration-500 md:group-hover:scale-105"
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 33vw"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            className="absolute bottom-2 right-2 bg-yellow-600/50 backdrop-blur-lg text-white text-xs md:text-sm hover:bg-yellow-600/70 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleDownload(
                imageUrl,
                `hasil-${item.mata_lomba}-${item.nama_sekolah}.jpg`
              );
            }}
          >
            <DownloadCloud className="w-4 h-4 md:w-5 md:h-5 mr-1" />
            <span className="font-medium">Unduh</span>
          </Button>
        </div>
      </div>
      
      <div className="p-3 md:p-4 space-y-1.5 md:space-y-2.5">
        <h3 className="font-semibold text-gray-100 text-sm md:text-lg line-clamp-1">
          {item.mata_lomba.replace(/_/g, ' ')}
        </h3>
        <div className="flex items-center gap-1.5 text-xs md:text-sm text-yellow-200">
          <School className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
          <span className="line-clamp-1">{item.nama_sekolah.replace(/_/g, ' ')}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs md:text-sm text-gray-400">
          <Hash className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
          <span>#{item.nomor_urut}</span>
        </div>
      </div>
    </article>
  );
})}
          </div>
        )}

        {/* Lightbox */}
        <Lightbox
          open={openLightbox}
          close={() => setOpenLightbox(false)}
          slides={[{ src: selectedImage }]}
          controller={{ touchAction: 'pan-y' }}
          carousel={{ finite: true }}
          render={{
            buttonPrev: () => null,
            buttonNext: () => null,
          }}
          styles={{
            container: { 
              backgroundColor: 'rgba(0,0,0,0.95)',
              padding: '1rem' 
            },
          }}
        />
      </div>
    </div>
  );
};

export default HasilAkhirPage;