'use client';

import { useState, useEffect, useMemo } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  data?: any;
  onSuccess: () => void;
}

export default function FormModal({ open, onClose, data, onSuccess }: FormModalProps) {
  const [formData, setFormData] = useState({
    nama_sekolah: '',
    pembina: '',
    whatsapp: '+62',
    kategori: '',
    tandu_putra: 0,
    tandu_putri: 0,
    pertolongan_pertama: 0,
    senam_poco_poco: 0,
    mojang_jajaka: 0,
    poster: 0,
    pmr_cerdas: 0,
    total: 0,
    nama_pengirim: '',
    kwitansi_url:'',
    bukti: '',
  });

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData(data);
    } else {
      setFormData({
        nama_sekolah: '',
        pembina: '',
        whatsapp: '+62',
        kategori: '',
        tandu_putra: 0,
        tandu_putri: 0,
        pertolongan_pertama: 0,
        senam_poco_poco: 0,
        mojang_jajaka: 0,
        poster: 0,
        pmr_cerdas: 0,
        total: 0,
        nama_pengirim: '',
        kwitansi_url: '',
        bukti: '',
      });
    }
  }, [data]);

  const total = useMemo(() => {
    return (
      formData.tandu_putra +
      formData.tandu_putri +
      formData.pertolongan_pertama +
      formData.senam_poco_poco +
      formData.mojang_jajaka +
      formData.poster +
      formData.pmr_cerdas
    );
  }, [
    formData.tandu_putra,
    formData.tandu_putri,
    formData.pertolongan_pertama,
    formData.senam_poco_poco,
    formData.mojang_jajaka,
    formData.poster,
    formData.pmr_cerdas,
  ]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, total }));
  }, [total]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'kategori' || name === 'nama_pengirim' || name === 'nama_sekolah' || name === 'pembina' || name === 'whatsapp' ? value : Number(value),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleSubmit = async () => {
    setUploading(true);
    let uploadedUrl = formData.bukti;

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const { error: storageError } = await supabase.storage
        .from('bukti-pembayaran')
        .upload(fileName, file);

      if (storageError) {
        console.error('Upload error:', storageError.message);
        setUploading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('bukti-pembayaran')
        .getPublicUrl(fileName);

      uploadedUrl = publicUrlData.publicUrl;
    }

    const payload = { ...formData, bukti: uploadedUrl };

    let response;
    if (data?.id) {
      response = await supabase
        .from('pendaftaran')
        .update(payload)
        .eq('id', data.id);
    } else {
      response = await supabase.from('pendaftaran').insert(payload);
    }

    if (response.error) {
      console.error('Error saving data:', response.error.message);
    } else {
      onSuccess();
    }

    setUploading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl rounded-xl bg-white shadow-lg p-8 overflow-y-auto max-h-[90vh]">
          <Dialog.Title className="text-2xl font-semibold mb-6 text-gray-800">
            {data ? 'Edit Pendaftar' : 'Tambah Pendaftar'}
          </Dialog.Title>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['nama_sekolah', 'pembina', 'whatsapp', 'nama_pengirim'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-1">
                  {field.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </label>
                <input
                  type="text"
                  name={field}
                  value={formData[field as keyof typeof formData]}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded-md"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium mb-1">Kategori</label>
              <select
                name="kategori"
                value={formData.kategori}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-md"
              >
                <option value="">Pilih Kategori</option>
                <option value="Madya">Madya</option>
                <option value="Wira">Wira</option>
              </select>
            </div>

            {["tandu_putra", "tandu_putri", "pertolongan_pertama", "senam_poco_poco", "mojang_jajaka", "poster", "pmr_cerdas"].map((name) => (
              <div key={name}>
                <label className="block text-sm font-medium mb-1">{name.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</label>
                <input
                  type="number"
                  name={name}
                  value={formData[name as keyof typeof formData]}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded-md"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium mb-1">Upload Bukti Pembayaran</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full border border-gray-300 p-2 rounded-md"
              />
              {formData.bukti && (
                <a
                  href={formData.bukti}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 underline mt-1 inline-block"
                >
                  Lihat bukti sebelumnya
                </a>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <Button onClick={onClose} variant="outline" className="w-full sm:w-auto">Batal</Button>
            <Button onClick={handleSubmit} disabled={uploading} className="w-full sm:w-auto">
              {uploading ? 'Menyimpan...' : data ? 'Update' : 'Tambah'}
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
