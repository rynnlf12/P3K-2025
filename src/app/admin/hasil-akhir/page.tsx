'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchIcon, X, Download, Trophy } from 'lucide-react';
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

const lombaList = [
  'Tandu Putra',
  'Tandu Putri',
  'Pertolongan Pertama',
  'Senam Poco Poco',
  'Mojang Jajaka',
  'Poster',
  'PMR Cerdas',
];

type HasilAkhir = {
  nama_sekolah: string;
  file_path: string;
  mata_lomba: string;
};

const HasilAkhirPage = () => {
  const [selectedLomba, setSelectedLomba] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hasil, setHasil] = useState<HasilAkhir[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCaption, setSelectedCaption] = useState<string | null>(null);
  const [errorStates, setErrorStates] = useState<Record<number, boolean>>({});
  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    if (!selectedLomba) return;

    setLoading(true);
    try {
      const sanitizedLomba = selectedLomba.replace(/\s+/g, '_');
      
      const { data, error } = await supabase
        .from('hasil_akhir')
        .select('*')
        .eq('mata_lomba', sanitizedLomba)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);

      const hasilWithUrl = await Promise.all(
        data.map(async (file) => {
          try {
            const filePath = `${file.mata_lomba}/${file.nama_sekolah}-${file.nomor_urut}.${file.file_extension}`;
            const { data: urlData } = supabase.storage
              .from('hasil-akhir')
              .getPublicUrl(filePath);

            return {
              nama_sekolah: file.nama_sekolah,
              file_path: `${urlData.publicUrl}?width=800&quality=80`,
              mata_lomba: file.mata_lomba,
            };
          } catch (error) {
            console.error('Error fetching image:', error);
            return {
              ...file,
              file_path: '/fallback-image.jpg'
            };
          }
        })
      );
      
      setHasil(hasilWithUrl);
    } catch (error: any) {
      showToast({
        title: 'Error',
        message: error.message,
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedLomba, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData, selectedLomba]);

  const filteredResults = hasil.filter(item =>
    item.nama_sekolah.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
        {/* Header Section */}
        <div className="mb-12 text-center space-y-4">
          <div className="inline-flex items-center gap-3 bg-red-100/80 px-6 py-2 rounded-full mb-4">
            <Trophy className="w-6 h-6 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-700">P3K2025</span>
          </div>
          <h1 className="text-4xl font-bold text-yellow-700 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Hasil Penilaian
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Telusuri hasil penilaian kompetisi P3K 2025 dengan mudah dan cepat
          </p>
        </div>

        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex-1">
            <div className="relative">
              <Input
                placeholder="Cari sekolah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <SearchIcon className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="flex-1">
            <Select value={selectedLomba} onValueChange={setSelectedLomba}>
              <SelectTrigger className="w-full h-12 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-blue-500">
                <SelectValue placeholder="Pilih Mata Lomba" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-lg border border-gray-100">
                {lombaList.map((item) => (
                  <SelectItem 
                    key={item} 
                    value={item}
                    className="hover:bg-blue-50 focus:bg-blue-50 rounded-lg"
                  >
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, idx) => (
              <Skeleton 
                key={idx} 
                className="h-80 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse"
              />
            ))}
          </div>
        ) : filteredResults.length === 0 && selectedLomba ? (
          <div className="text-center py-12 space-y-6">
            <div className="inline-flex bg-blue-50 p-4 rounded-full">
              <SearchIcon className="h-16 w-16 text-yellow-400/80" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-gray-900">
                Hasil tidak ditemukan
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Tidak ada hasil untuk pencarian &quot;{searchQuery}&quot;. Coba kata kunci lain atau pilih mata lomba berbeda.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredResults.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedImage(item.file_path);
                  setSelectedCaption(item.nama_sekolah);
                }}
                className="group cursor-pointer relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-white border border-gray-100"
              >
                <div className="aspect-[4/5] relative">
                  <Image
                    src={errorStates[idx] ? '/fallback-image.jpg' : item.file_path}
                    alt={`Hasil - ${item.nama_sekolah}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mO8fPl8PQAH5wLHDQUZ0wAAAABJRU5ErkJggg=="
                    onError={(e) => {
                      setErrorStates(prev => ({...prev, [idx]: true}));
                      e.currentTarget.src = '/fallback-image.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1">
                  <p className="text-white font-semibold truncate text-shadow-lg">
                    {item.nama_sekolah}
                  </p>
                  <span className="inline-block px-2 py-1 bg-blue-500/90 text-xs font-medium text-white rounded-md">
                    {item.mata_lomba.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Preview Dialog */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogOverlay className="bg-black/60 backdrop-blur-sm fixed inset-0 z-40" />
          <DialogContent
            className={cn(
              "fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-4xl max-h-[90vh]",
              "transform -translate-x-1/2 -translate-y-1/2",
              "rounded-2xl shadow-2xl border border-gray-100 bg-white",
              "p-0 overflow-hidden"
            )}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-50 bg-white/90 hover:bg-gray-100 rounded-full p-2 shadow-md backdrop-blur-sm transition-all"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>

            {selectedImage && (
              <div className="flex flex-col items-center justify-center">
                <div className="w-full max-h-[70vh] overflow-hidden flex items-center justify-center p-4">
                  <Zoom>
                    <div className="relative w-full h-full">
                      <Image
                        src={selectedImage}
                        alt="Full preview"
                        fill
                        className="object-contain rounded-lg cursor-zoom-in"
                        placeholder="blur"
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mO8fPl8PQAH5wLHDQUZ0wAAAABJRU5ErkJggg=="
                        onError={(e) => {
                          e.currentTarget.src = '/fallback-image.jpg';
                        }}
                      />
                    </div>
                  </Zoom>
                </div>
                
                <div className="w-full bg-gray-50 border-t p-4">
                  <div className="flex items-center justify-between max-w-2xl mx-auto">
                    <div className="space-y-1">
                      {selectedCaption && (
                        <p className="font-medium text-gray-900">
                          {selectedCaption}
                        </p>
                      )}
                      <span className="text-sm text-gray-500">
                        {selectedImage?.split('.').pop()?.toUpperCase()} •{' '}
                        {new URL(selectedImage).pathname.split('/').pop()}
                      </span>
                    </div>
                    <a
                      href={selectedImage}
                      download
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      <span className="font-medium">Download</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default HasilAkhirPage;