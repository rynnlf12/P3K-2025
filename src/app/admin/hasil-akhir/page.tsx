'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchIcon, X, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
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
  const { showToast } = useToast();

  const fetchData = async () => {
    if (!selectedLomba) return;

    setLoading(true);
    try {
      const sanitizedLomba = selectedLomba.replace(/\s+/g, '_');
      const { data, error } = await supabase
        .from('hasil_akhir')
        .select('*')
        .eq('mata_lomba', sanitizedLomba);

      if (error) throw new Error(error.message);

      const hasilWithUrl = await Promise.all(
        data.map(async (file) => {
          const filePath = `${file.mata_lomba}/${file.nama_sekolah}-${file.nomor_urut}.${file.file_extension}`;
          const { data: urlData } = supabase.storage
            .from('hasil-akhir')
            .getPublicUrl(filePath);

          if (!urlData?.publicUrl) {
            throw new Error(`Gagal mendapatkan URL untuk ${filePath}`);
          }

          return {
            nama_sekolah: file.nama_sekolah,
            file_path: urlData.publicUrl,
            mata_lomba: file.mata_lomba,
          };
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
  };

  useEffect(() => {
    fetchData();
  }, [selectedLomba]);

  const filteredResults = hasil.filter(item =>
    item.nama_sekolah.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-26">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">HASIL PENILAIAN</h1>
        <p className="text-gray-600">Lihat hasil penilaian kompetisi P3K 2025</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Cari Sekolah</label>
          <div className="relative">
            <Input
              placeholder="Cari berdasarkan nama sekolah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Mata Lomba</label>
          <Select value={selectedLomba} onValueChange={setSelectedLomba}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih Lomba" />
            </SelectTrigger>
            <SelectContent>
              {lombaList.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, idx) => (
            <Skeleton key={idx} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : filteredResults.length === 0 && selectedLomba ? (
        <div className="text-center py-12">
          <SearchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            Tidak ditemukan hasil untuk {searchQuery}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Silakan coba dengan kata kunci atau lomba yang berbeda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredResults.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                setSelectedImage(item.file_path);
                setSelectedCaption(item.nama_sekolah);
              }}
              className="group cursor-pointer relative rounded-2xl overflow-hidden shadow hover:shadow-lg transition-all bg-black"
            >
              <div className="aspect-[4/5] relative">
                {item.file_path ? (
                  <Image
                    src={item.file_path}
                    alt={`Hasil - ${item.nama_sekolah}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">Gambar tidak tersedia</span>
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white font-semibold truncate">{item.nama_sekolah}</p>
                <p className="text-sm text-gray-200 truncate">
                  {item.mata_lomba.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogOverlay className="bg-black/60 backdrop-blur-sm fixed inset-0 z-40 data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut" />
        <DialogContent
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-5xl max-h-[90vh] overflow-auto p-0",
            "translate-x-[-50%] translate-y-[-50%]",
            "rounded-2xl shadow-xl border border-neutral-200 bg-white",
            "data-[state=open]:animate-slideIn data-[state=closed]:animate-slideOut",
            "transition-all ease-in-out duration-300"
          )}
        >
          <DialogTitle className="sr-only">Preview Gambar Hasil Akhir</DialogTitle>

          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 z-50 bg-white rounded-full p-2 shadow hover:bg-neutral-100 transition"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          {selectedImage && (
            <a
              href={selectedImage}
              download
              className="absolute top-4 left-4 z-50 bg-white rounded-full p-2 shadow hover:bg-neutral-100 transition"
              aria-label="Download gambar"
            >
              <Download className="w-5 h-5" />
            </a>
          )}

          {selectedImage && (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 gap-4">
              <Zoom>
                <Image
                  src={selectedImage}
                  alt="Full preview"
                  width={1200}
                  height={800}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg cursor-zoom-in"
                />
              </Zoom>
              {selectedCaption && (
                <p className="text-sm text-neutral-600 text-center italic">
                  {selectedCaption}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HasilAkhirPage;
