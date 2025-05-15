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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-25">
        {/* Header Section */}
        <div className="mb-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 mb-4">
            <Trophy className="h-5 w-5 text-amber-400" />
            <span className="text-sm text-amber-300">P3K 2025</span>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
            Hasil Penilaian Peserta
          </h1>
          <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto">
            Berikut Form Hasil Penilaian Peserta seluruh mata lomba 
          </p>
        </div>

        {/* Filter Section */}
        <div className="mb-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg mx-2">
          <div className="flex flex-col md:flex-row gap-3 p-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-400">
                  <Search className="h-5 w-5" />
                </div>
                <Input
                  placeholder="Cari sekolah..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm md:text-base border-2 border-white/20 bg-white/5 text-gray-200"
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-400">
                  <Filter className="h-5 w-5" />
                </div>
                <select
                  value={selectedLomba}
                  onChange={(e) => setSelectedLomba(e.target.value)}
                  className="w-full pl-10 text-sm md:text-base border-2 border-white/20 bg-white/5 text-gray-200 rounded-lg"
                >
                  <option value="">Semua Lomba</option>
                  {lombaList.map((lomba) => (
                    <option key={lomba} value={lomba}>{lomba}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {(selectedLomba || searchQuery) && (
            <div className="px-4 pb-4 flex flex-wrap gap-2">
              {selectedLomba && (
                <div className="bg-amber-400/10 px-3 py-1.5 rounded-full text-sm flex items-center gap-2 border border-amber-400/20">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  {selectedLomba}
                  <button 
                    onClick={() => setSelectedLomba('')}
                    className="text-amber-400 hover:text-amber-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              {searchQuery && (
                <div className="bg-purple-400/10 px-3 py-1.5 rounded-full text-sm flex items-center gap-2 border border-purple-400/20">
                  <School className="h-4 w-4 text-purple-400" />
                  {searchQuery}
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-purple-400 hover:text-purple-300"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl border border-white/10">
                <div className="aspect-square bg-gray-800 rounded-t-xl" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-700 rounded-full w-3/4" />
                  <div className="h-3 bg-gray-800 rounded-full w-1/2" />
                  <div className="h-3 bg-gray-800 rounded-full w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="mx-auto w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
              <Search className="h-10 w-10 text-amber-400/30" />
            </div>
            <h2 className="text-xl font-semibold text-gray-200">Data Tidak Ditemukan</h2>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">
              Coba gunakan pencarian atau filter berbeda
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-2">
            {filteredData.map((item) => {
              const imageUrl = supabase.storage
                .from('hasil-akhir')
                .getPublicUrl(item.file_path).data.publicUrl;

              return (
                <article 
                  key={item.id}
                  className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
                >
                  <div 
                    className="relative aspect-square cursor-pointer"
                    onClick={() => {
                      setSelectedImage(imageUrl);
                      setOpenLightbox(true);
                    }}
                  >
                    <Image
                      src={imageUrl}
                      alt={`${item.mata_lomba.replace(/_/g, ' ')} - ${item.nama_sekolah.replace(/_/g, ' ')}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                      <Button
                        size="sm"
                        className="absolute bottom-2 right-2 bg-amber-400/20 backdrop-blur-sm text-amber-300 hover:bg-amber-400/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(imageUrl, `hasil-${item.mata_lomba}-${item.nama_sekolah}.jpg`);
                        }}
                      >
                        <DownloadCloud className="w-4 h-4 mr-1" />
                        Unduh
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-gray-100 text-sm line-clamp-1">
                      {item.mata_lomba.replace(/_/g, ' ')}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-amber-300">
                      <School className="h-4 w-4 flex-shrink-0" />
                      <span className="line-clamp-1">{item.nama_sekolah.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Hash className="h-4 w-4 flex-shrink-0" />
                      <span>#{item.nomor_urut}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <Lightbox
          open={openLightbox}
          close={() => setOpenLightbox(false)}
          slides={[{ src: selectedImage }]}
          controller={{ touchAction: 'pan-y' }}
          render={{
            buttonPrev: () => null,
            buttonNext: () => null,
          }}
          styles={{
            container: { 
              backgroundColor: 'rgba(0,0,0,0.95)',
              padding: '0.5rem' 
            },
          }}
        />
      </div>
    </div>
  );
};

export default HasilAkhirPage;