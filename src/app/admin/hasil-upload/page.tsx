'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { useToast } from '@/components/ui/use-toast';

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

  const { showToast } = useToast(); // ✅ tanpa argumen

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
    <div className="max-w-xl mx-auto px-4 py-8 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-semibold mb-6">Upload Hasil Akhir</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Mata Lomba</label>
          <select
            value={mata_lomba}
            onChange={(e) => setLomba(e.target.value)}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Pilih lomba</option>
            {lombaList.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nama Sekolah</label>
          <input
            type="text"
            value={nama_sekolah}
            onChange={(e) => setNamaSekolah(e.target.value)}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md"
            placeholder="Contoh: SMAN 1 Bandung"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nomor Urut Peserta</label>
          <input
            type="text"
            value={nomor_urut}
            onChange={(e) => setNomorUrut(e.target.value)}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md"
            placeholder="Contoh: 12"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Unggah Foto</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1"
            required
          />
        </div>

        {preview && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Preview:</p>
            <Image
            src={preview}
            alt={`Preview of file for ${mata_lomba} - ${nama_sekolah} (${nomor_urut})`}
            width={500}
            height={300}
            className="rounded-md border"
            />
          </div>
        )}

        <div className="pt-4 text-right">
          <Button onClick={handleUpload} disabled={loading}>
            {loading ? 'Mengunggah...' : 'Upload'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HasilUploadPage;
