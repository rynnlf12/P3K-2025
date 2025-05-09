'use client';

import { useState, useEffect, useMemo } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { LOMBA_LIST } from '@/data/lomba';

const fieldToLombaIdMap: Record<string, string> = {
  tandu_putra: 'tandu_putra',
  tandu_putri: 'tandu_putri',
  pertolongan_pertama: 'pertolongan_pertama',
  senam_poco_poco: 'senam_poco_poco',
  mojang_jajaka: 'mojang_jajaka',
  poster: 'poster',
  pmr_cerdas: 'pmr_cerdas',
};

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
    bukti: '',
    status_verifikasi: 'pending',
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
        bukti: '',
        status_verifikasi: 'pending',
      });
    }
  }, [data]);

  const total = useMemo(() => {
    return Object.entries(fieldToLombaIdMap).reduce((acc, [field, lombaId]) => {
      const jumlah = formData[field as keyof typeof formData] as number;
      const lomba = LOMBA_LIST.find((l) => l.id === lombaId);
      return acc + (lomba ? lomba.biaya * jumlah : 0);
    }, 0);
  }, [formData]);

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
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    const timestamp = Date.now();
    const nomor = `P3K2025-${formData.nama_sekolah.replace(/\s+/g, '').toUpperCase().slice(0, 10)}-${timestamp}`;

    let buktiURL = '';

    try {
      if (file) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('bukti-pembayaran')
          .upload(`bukti/${nomor}/${file.name}`, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('bukti-pembayaran')
          .getPublicUrl(uploadData.path);

        buktiURL = urlData.publicUrl;
      }

      const { error: insertError } = await supabase.from('pendaftaran').insert([
        {
          nomor,
          ...formData,
          bukti: buktiURL,
        },
      ]);

      if (insertError) throw insertError;

      const response = await fetch(`/api/generate-kwitansi?nomor=${nomor}`);

      if (!response.ok) throw new Error('Gagal membuat kwitansi');

      const responseData = await response.json();

      if (responseData?.success) {
        const kwitansiUrl = responseData.kwitansi_url;

        await supabase
          .from('pendaftaran')
          .update({ kwitansi_url: kwitansiUrl })
          .eq('nomor', nomor);

        alert('Data berhasil disimpan dan kwitansi dibuat!');
      } else {
        throw new Error('Gagal mendapatkan URL kwitansi');
      }

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
        bukti: '',
        status_verifikasi: 'pending',
      });
      setFile(null);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving data:', err);
      alert('Terjadi kesalahan saat menyimpan data.');
    } finally {
      setUploading(false);
    }
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
            {['nama_sekolah', 'pembina', 'whatsapp'].map((field) => (
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

            {Object.keys(fieldToLombaIdMap).map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-1">
                  {field.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </label>
                <input
                  type="number"
                  name={field}
                  value={formData[field as keyof typeof formData]}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded-md"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium mb-1">Nama Pengirim</label>
              <input
                type="text"
                name="nama_pengirim"
                value={formData.nama_pengirim}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bukti Pembayaran</label>
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
                  Lihat Bukti Sebelumnya
                </a>
              )}
            </div>

            <div className="col-span-2 mt-4">
              <div className="flex justify-between items-center">
                <div className="font-semibold text-lg">Total: Rp{formData.total.toLocaleString()}</div>
                <Button onClick={handleSubmit} disabled={uploading}>
                  {uploading ? 'Menyimpan...' : data ? 'Update' : 'Tambah'}
                </Button>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
