'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CalendarDays, FileDown } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

export default function InformasiPage() {
  return (
    <div className="min-h-screen px-4 md:px-16 py-40 bg-gradient-to-br from-yellow-100 to-pink-100 font-sans">
      <motion.div
        className="max-w-4xl mx-auto space-y-10"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.2 } } }}
      >
        <motion.h1
          className="text-3xl md:text-4xl font-bold text-center text-yellow-600"
          variants={fadeInUp}
        >
          Informasi Perlombaan
        </motion.h1>

        {/* Judul dan Tema */}
        <motion.div variants={fadeInUp}>
          <Card>
            <div className="bg-yellow-100 p-4 rounded-t-lg">
              <h3 className="text-xl font-semibold text-yellow-600">INFORMASI KEGIATAN</h3>
            </div>
            <div className="p-4">
              <p className="mb-4 font-bold">Pekan Perlombaan PMR (P3K) KSR PMI Unit Universitas Suryakancana Tingkat Wira dan Madya Se-Wilayah Provinsi Jawa Barat Tahun 2025</p>
              <p className="mb-2 font-semibold">Tema:</p>
              <p>
              &quot;&ldquo;Golden Hours, Spread Knowledge and Save Lifes&rdquo;&quot;
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Technical Meeting */}
        <motion.div variants={fadeInUp}>
          <Card>
            <div className="bg-yellow-100 p-4 rounded-t-lg">
              <h3 className="text-xl font-semibold text-yellow-600">TECHNICAL MEETING</h3>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="w-5 h-5 text-yellow-600" />
                <p><strong>Waktu :</strong> Sabtu, 10 Mei 2025 Pukul 08.00</p>
              </div>
              <p><strong>Tempat :</strong> Ruang D7 FKIP Universitas Suryakancana</p>
            </div>
          </Card>
        </motion.div>

        {/* Pelaksanaan Lomba */}
        <motion.div variants={fadeInUp}>
          <Card>
            <div className="bg-yellow-100 p-4 rounded-t-lg">
              <h3 className="text-xl font-semibold text-yellow-600">JADWAL KEGIATAN</h3>
            </div>
            <div className="p-4">
              <p className="mb-2"><strong>Hari 1 - Jumat, 30 Mei 2025 Pukul 08.00 - 16.30 :</strong></p>
              <ul className="list-disc list-inside mb-4">
                <li>Daftar Ulang Lomba</li>
                <li>Pembukaan</li>
                <li>Poster</li>
                <li>PMR Cerdas</li>
                <li>Mojang Jajaka</li>
              </ul>
              <p className="mb-2"><strong>Hari 2 - Sabtu, 31 Mei 2025 Pukul 08.00 - 16.30 :</strong></p>
              <ul className="list-disc list-inside mb-4">
                <li>Daftar Ulang Lomba</li>
                <li>Pertolongan Pertama</li>
                <li>Tandu Putra & Putri</li>
              </ul>
              <p className="mb-2"><strong>Hari 3 - Minggu, 1 Juni 2025 Pukul 08.00 - 16.30 :</strong></p>
              <ul className="list-disc list-inside">
                <li>Daftar Ulang Lomba</li>
                <li>Senam Kreasi Poco-Poco</li>
                <li>Mojang Jajaka (Unjuk Kabisa)</li>
                <li>Penutupan dan Pengumuman</li>
              </ul>
            </div>
          </Card>
        </motion.div>

        {/* Juklak Juknis */}
        <motion.div variants={fadeInUp}>
          <Card>
            <div className="bg-yellow-100 p-4 rounded-t-lg">
              <h3 className="text-xl font-semibold text-yellow-600">JUJU HASIL TECHNICAL MEETING DAN LIST ISI TAS PP</h3>
            </div>
            <div className="p-4 flex flex-col items-start">
              <Button
                asChild
                variant="default"
                className="bg-yellow-700 hover:bg-yellow-600 text-white"
              >
                <a
                  href="https://drive.google.com/drive/folders/1HAsBXoPitXxJXpGss1smselXrWCHH5Jo?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <FileDown className="w-5 h-5" />
                  Download JUJU dan Isi Tas PP
                </a>
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <div className="bg-yellow-100 p-4 rounded-t-lg">
              <h3 className="text-xl font-semibold text-yellow-600">GROUP PESERTA P3K 2025</h3>
            </div>
            <div className="p-4 flex flex-col items-start">
              <Button
                asChild
                variant="default"
                className="bg-yellow-700 hover:bg-yellow-600 text-white"
              >
                <a
                  href="https://chat.whatsapp.com/LV2Q7IEeT7wDyJCkaZqC7n"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <FileDown className="w-5 h-5" />
                  Link Grup Peserta
                </a>
              </Button>
            </div>
          </Card>
        </motion.div>

                {/* Juklak Juknis */}
                <motion.div variants={fadeInUp}>
          <Card>
            <div className="bg-yellow-100 p-4 rounded-t-lg">
              <h3 className="text-xl font-semibold text-yellow-600">BELUM DAFTAR?</h3>
            </div>
            <div className="p-4 flex flex-col items-start">
              <Button
                asChild
                variant="default"
                className="bg-yellow-700 hover:bg-yellow-600 text-white"
              >
                <a
                  href="/daftar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <FileDown className="w-5 h-5" />
                  Daftar Langsung
                </a>
              </Button>
            </div>
          </Card>
        </motion.div>

      </motion.div>
    </div>
  );
}
