'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { useToast } from '@/components/ui/use-toast';
import { Trophy, School, Hash, UploadCloud } from 'lucide-react';

const lombaList = [
  'Tandu Putra',
  'Tandu Putri',
  'Pertolongan Pertama',
  'Senam Poco Poco',
  'Mojang Jajaka',
  'Poster',
  'PMR Cerdas',
];

const HasilUploadPage = () => {
  const [mata_lomba, setLomba] = useState('');
  const [nama_sekolah, setNamaSekolah] = useState('');
  const [nomor_urut, setNomorUrut] = useState('');
  const [file_path, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const { showToast } = useToast();

 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const selectedFile = e.target.files?.[0] || null;
  setFile(selectedFile);

  if (selectedFile) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string); // base64 encoded image preview
    };
    reader.readAsDataURL(selectedFile);
  } else {
    setPreview(null);
  }
};

const handleUpload = async () => {
  if (!mata_lomba || !nama_sekolah || !nomor_urut || !file_path) {
    showToast({
      message: 'Semua bidang wajib diisi dan file harus dipilih.',
      title: 'Gagal Upload',
      variant: 'error',
    });
    return;
  }

  setLoading(true);

  const fileExt = file_path.name.split('.').pop();
  if (!fileExt) {
    showToast({
      title: 'Error',
      message: 'Gagal membaca ekstensi file. Pastikan file valid.',
      variant: 'error',
    });
    setLoading(false);
    return;
  }

  // Format nama file tanpa encoding
  const sanitizedLomba = mata_lomba.replace(/\s+/g, '_'); // "Tandu Putra" -> "Tandu_Putra"
  const sanitizedSekolah = nama_sekolah.replace(/\s+/g, '_'); // "SMKN 1 CIANJUR" -> "SMKN_1_CIANJUR"
  const fileName = `${sanitizedLomba}/${sanitizedSekolah}-${nomor_urut}.${fileExt}`;

  // Upload file
  const { error: uploadError } = await supabase.storage
    .from('hasil-akhir')
    .upload(fileName, file_path, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    showToast({
      message: 'Gagal mengunggah file: ' + uploadError.message,
      title: 'Error Upload',
      variant: 'error',
    });
    setLoading(false);
    return;
  }

  // Dapatkan public URL
  const { data: urlData } = supabase.storage
    .from('hasil-akhir')
    .getPublicUrl(fileName);

  if (!urlData?.publicUrl) {
    showToast({
      title: 'Gagal Mendapatkan URL',
      message: 'Tidak bisa mendapatkan URL file publik.',
      variant: 'error',
    });
    setLoading(false);
    return;
  }

  // Simpan metadata ke tabel `hasil_akhir`
  const { error: dbError } = await supabase
    .from('hasil_akhir')
    .insert([{
      mata_lomba: sanitizedLomba,
      nama_sekolah: sanitizedSekolah,
      nomor_urut,
      file_path: fileName,
      file_extension: fileExt,
    }]);

  if (dbError) {
    showToast({
      message: 'Gagal menyimpan metadata: ' + dbError.message,
      title: 'Error Database',
      variant: 'error',
    });
  } else {
    showToast({
      message: 'Berhasil mengunggah file hasil akhir!',
      title: 'Upload Sukses',
      variant: 'success',
    });

    // Reset form
    setLomba('');
    setNamaSekolah('');
    setNomorUrut('');
    setFile(null);
    setPreview(null);
  }

  setLoading(false);
};

return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#7A1F1F] to-[#3A1C1C]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm px-6 py-2 rounded-full border border-white/10 mb-4">
              <Trophy className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-medium text-gray-200">P3K 2025</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#B8860B] mb-2">
              Upload Hasil Akhir
            </h1>
            <p className="text-gray-300 text-sm md:text-base">Unggah hasil karya peserta sesuai ketentuan lomba</p>
          </div>

          {/* Form Section */}
          <div className="space-y-6">
            {/* Mata Lomba */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2">Mata Lomba</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Trophy className="h-5 w-5" />
                </div>
                <select
                  value={mata_lomba}
                  onChange={(e) => setLomba(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-white/20 bg-red-900/50 text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                  required
                >
                  <option value="">Pilih Mata Lomba</option>
                  {lombaList.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nama Sekolah */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2">Nama Sekolah</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <School className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={nama_sekolah}
                  onChange={(e) => setNamaSekolah(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-white/20 bg-red-900/50 text-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                  placeholder=" Masukkan nama sekolah"
                  required
                />
              </div>
            </div>

            {/* Nomor Urut */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2">Nomor Urut</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Hash className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={nomor_urut}
                  onChange={(e) => setNomorUrut(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-white/20 bg-red-900/50 text-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                  placeholder="Contoh: 12"
                  required
                />
              </div>
            </div>

            {/* File Upload */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2">Unggah Karya</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  required
                />
                <label 
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/20 rounded-xl bg-white/5 hover:border-yellow-400 transition-colors cursor-pointer"
                >
                  <UploadCloud className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-gray-300 text-sm">
                    {file_path ? file_path.name : 'Pilih file gambar'}
                  </span>
                  <span className="text-gray-400 text-xs mt-1">(Max. 5MB)</span>
                </label>
              </div>
            </div>

            {/* Preview */}
            {preview && (
              <div className="mt-4">
                <p className="text-sm text-gray-300 mb-2">Preview:</p>
                <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-white/10">
                  <Image
                    src={preview}
                    alt={`Preview karya ${nama_sekolah}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6">
              <Button 
                onClick={handleUpload} 
                disabled={loading}
                className="w-full py-6 text-lg bg-gradient-to-r from-yellow-600 to-amber-700 hover:from-yellow-700 hover:to-amber-800 rounded-xl transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Mengunggah...
                  </span>
                ) : (
                  'Upload Sekarang'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HasilUploadPage;