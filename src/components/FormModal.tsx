'use client';
import { useState, useEffect, useMemo } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { LOMBA_LIST } from '@/data/lomba';
import { motion, AnimatePresence } from 'framer-motion';
import { AiOutlineWarning } from 'react-icons/ai';

const MotionButton = motion(Button);

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  data?: any;
  onSuccess: () => void;
}



export default function FormModal({ open, onClose, data, onSuccess }: FormModalProps) {
  // State untuk data pendaftaran
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
  });

  // State untuk data peserta
  const [peserta, setPeserta] = useState<Record<string, string[][]>>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Inisialisasi form data
  useEffect(() => {
    if (data) {
      setFormData({
        nama_sekolah: data.nama_sekolah,
        pembina: data.pembina,
        whatsapp: data.whatsapp,
        kategori: data.kategori,
        tandu_putra: data.tandu_putra || 0,
        tandu_putri: data.tandu_putri || 0,
        pertolongan_pertama: data.pertolongan_pertama || 0,
        senam_poco_poco: data.senam_poco_poco || 0,
        mojang_jajaka: data.mojang_jajaka || 0,
        poster: data.poster || 0,
        pmr_cerdas: data.pmr_cerdas || 0,
        total: data.total || 0,
      });
      
      if (data.peserta) {
        setPeserta(data.peserta);
      }
    }
  }, [data]);

  // Hitung total biaya
  const total = useMemo(() => {
    return LOMBA_LIST.reduce((acc, lomba) => {
      const fieldName = lomba.id.replace(/-/g, '_');
      const jumlah = formData[fieldName as keyof typeof formData] as number;
      return acc + (lomba.biaya * jumlah);
    }, 0);
  }, [formData]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, total }));
  }, [total]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'kategori' || name === 'nama_sekolah' || name === 'pembina' || name === 'whatsapp' 
        ? value 
        : Number(value),
    }));
  };

  const handlePesertaChange = (lombaId: string, timIndex: number, pesertaIndex: number, value: string) => {
    setPeserta(prev => {
      const updated = { ...prev };
      if (!updated[lombaId]) updated[lombaId] = [];
      if (!updated[lombaId][timIndex]) updated[lombaId][timIndex] = [];
      updated[lombaId][timIndex][pesertaIndex] = value;
      return updated;
    });
  };

const validateForm = () => {
  const errors: string[] = [];
  
  if (!formData.nama_sekolah.trim()) {
    errors.push('Nama sekolah harus diisi');
  }
  
  if (!formData.pembina.trim()) {
    errors.push('Nama pembina harus diisi');
  }
  
  if (!formData.whatsapp.trim() || !/^\+?\d+$/.test(formData.whatsapp)) {
    errors.push('Nomor WhatsApp tidak valid');
  }
  
  if (!formData.kategori) {
    errors.push('Kategori harus dipilih');
  }
  
  // Validasi data peserta
  Object.entries(peserta).forEach(([lombaId, tims]) => {
    const lomba = LOMBA_LIST.find(l => l.id === lombaId);
    const fieldName = lombaId.replace(/-/g, '_') as keyof typeof formData;
    const jumlahTim = Number(formData[fieldName]);
    
    if (lomba && jumlahTim > 0) {
      tims.forEach((tim, timIndex) => {
        tim.forEach((nama, pesertaIndex) => {
          if (!nama.trim()) {
            errors.push(`Nama anggota ${pesertaIndex + 1} Tim ${timIndex + 1} ${lomba.nama} belum diisi`);
          }
        });
      });
    }
  });
  
  setErrors(errors);
  return errors.length === 0;
};
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  setLoading(true);

  try {
    // 1. Generate nomor pendaftaran
    const nomor = `P3K${new Date().getFullYear()}-${formData.nama_sekolah
      .replace(/\s+/g, '')
      .toUpperCase()
      .slice(0, 10)}-${Date.now()}`;

    // 2. Simpan data pendaftaran utama
    const { data: pendaftaranData, error: pendaftaranError } = await supabase
      .from('pendaftaran')
      .insert({
        nomor,
        nama_sekolah: formData.nama_sekolah,
        pembina: formData.pembina,
        whatsapp: formData.whatsapp,
        kategori: formData.kategori,
        tandu_putra: formData.tandu_putra,
        tandu_putri: formData.tandu_putri,
        pertolongan_pertama: formData.pertolongan_pertama,
        senam_poco_poco: formData.senam_poco_poco,
        mojang_jajaka: formData.mojang_jajaka,
        poster: formData.poster,
        pmr_cerdas: formData.pmr_cerdas,
        total: formData.total,
      })
      .select()
      .single();

    if (pendaftaranError || !pendaftaranData) {
      throw new Error(pendaftaranError?.message || 'Gagal menyimpan data pendaftaran');
    }

    // 3. Simpan data peserta
    const pesertaToInsert = Object.entries(peserta)
      .flatMap(([lombaId, tims]) => {
        const lomba = LOMBA_LIST.find(l => l.id === lombaId);
        return tims.flatMap(tim => 
          tim.filter(nama => nama.trim()).map(nama => ({
            pendaftaran_id: pendaftaranData.id,
            nama_sekolah: formData.nama_sekolah,
            lomba: lomba?.nama || lombaId,
            data_peserta: nama.trim()
          }))
        );
      });

    if (pesertaToInsert.length > 0) {
      const { error: pesertaError } = await supabase
        .from('peserta')
        .insert(pesertaToInsert);

      if (pesertaError) {
        throw new Error(pesertaError.message || 'Gagal menyimpan data peserta');
      }
    }

    // 4. Generate kwitansi
    const response = await fetch(`/api/generate-kwitansi?nomor=${nomor}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gagal membuat kwitansi: ${errorText}`);
    }

    const responseData = await response.json();

    if (!responseData?.success) {
      throw new Error(responseData?.message || 'Gagal mendapatkan URL kwitansi');
    }

    // 5. Update data pendaftaran dengan URL kwitansi
    const { error: updateError } = await supabase
      .from('pendaftaran')
      .update({ kwitansi_url: responseData.kwitansi_url })
      .eq('id', pendaftaranData.id);

    if (updateError) {
      throw new Error('Gagal menyimpan URL kwitansi');
    }

    alert('Pendaftaran berhasil disimpan! Kwitansi telah dibuat.');
    onSuccess();
    onClose();

  } catch (err: any) {
    console.error('Error:', err);
    setErrors([err.message || 'Terjadi kesalahan saat menyimpan data']);
  } finally {
    setLoading(false);
  }
};

  // Render UI
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-4xl rounded-xl bg-white shadow-xl p-6 overflow-y-auto max-h-[90vh]"
        >
          <Dialog.Panel className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <Dialog.Title className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent">
                  {data ? 'Edit Pendaftaran' : 'Form Pendaftaran'}
                </Dialog.Title>
                <p className="text-sm text-gray-600 mt-1">
                  Lengkapi data sekolah dan peserta
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error messages */}
            <AnimatePresence>
              {errors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  {errors.map((error, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-red-600">
                      <AiOutlineWarning className="flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Data Sekolah */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nama Sekolah</label>
                  <input
                    type="text"
                    name="nama_sekolah"
                    value={formData.nama_sekolah}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nama Pembina</label>
                  <input
                    type="text"
                    name="pembina"
                    value={formData.pembina}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Kategori</label>
                  <select
                    name="kategori"
                    value={formData.kategori}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    <option value="Madya">Madya</option>
                    <option value="Wira">Wira</option>
                  </select>
                </div>
              </div>

              {/* Lomba dan Peserta */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">Pilihan Lomba</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {LOMBA_LIST.map((lomba) => {
                    const fieldName = lomba.id.replace(/-/g, '_');
                    return (
                      <div key={lomba.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-semibold text-gray-800">
                            {lomba.nama}
                          </label>
                          <span className="text-xs font-bold bg-red-200 text-red-800 px-2 py-1 rounded">
                            Rp{lomba.biaya.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <input
                          type="number"
                          name={fieldName}
                          value={formData[fieldName as keyof typeof formData] as number}
                          onChange={handleChange}
                          min="0"
                          max="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Input Nama Peserta */}
                <h3 className="text-lg font-semibold text-gray-800">Data Peserta</h3>
                {LOMBA_LIST.map((lomba) => {
                  const jumlahTim = formData[lomba.id.replace(/-/g, '_') as keyof typeof formData] as number;
                  if (jumlahTim <= 0) return null;

                  return (
                    <div key={lomba.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-3">
                        {lomba.nama} ({jumlahTim} Tim)
                      </h4>
                      
                      <div className="space-y-4">
                        {Array.from({ length: jumlahTim }).map((_, timIndex) => (
                          <div key={timIndex} className="bg-white p-3 rounded-md border border-gray-200 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Tim {timIndex + 1}</span>
                              <span className="text-xs text-gray-500">
                                {peserta[lomba.id]?.[timIndex]?.filter(Boolean).length || 0}/{lomba.maksPesertaPerTim} anggota
                              </span>
                            </div>
                            
                            {Array.from({ length: lomba.maksPesertaPerTim }).map((_, pesertaIndex) => (
                              <input
                                key={pesertaIndex}
                                type="text"
                                placeholder={`Anggota ${pesertaIndex + 1}`}
                                value={peserta[lomba.id]?.[timIndex]?.[pesertaIndex] || ''}
                                onChange={(e) => handlePesertaChange(lomba.id, timIndex, pesertaIndex, e.target.value)}
                                className={`w-full px-3 py-2 text-sm rounded border ${
                                  !peserta[lomba.id]?.[timIndex]?.[pesertaIndex]?.trim() ? 'border-yellow-400' : 'border-gray-200'
                                } focus:ring-1 focus:ring-blue-500`}
                                required
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Pembayaran */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="font-semibold text-gray-800">Total Pembayaran</div>
                  <div className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent">
                    Rp{formData.total.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  type="button"
                  disabled={loading}
                >
                  Batal
                </Button>
                <MotionButton
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-gradient-to-r from-yellow-600 to-red-600 hover:from-yellow-700 hover:to-red-700"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Menyimpan...
                    </span>
                  ) : (
                    'Simpan Pendaftaran'
                  )}
                </MotionButton>
              </div>
            </form>
          </Dialog.Panel>
        </motion.div>
      </div>
    </Dialog>
  );
}