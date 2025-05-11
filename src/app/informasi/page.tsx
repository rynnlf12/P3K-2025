'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CalendarDays, Download, FileText, Info, Link2, ListChecks, Users, ClipboardList } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function InformasiPage() {
  return (
    <div className="min-h-screen px-4 py-32 md:py-32 bg-gradient-to-br from-gray-50 to-blue-50 font-sans">
      <motion.div
        className="max-w-4xl mx-auto space-y-6"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.15 } }}}
      >
        {/* Header Section */}
        <motion.div className="text-center space-y-4" variants={fadeInUp}>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 bg-clip-text">
            Informasi Perlombaan P3K 2025
          </h1>
          <p className="text-gray-600 md:text-lg max-w-2xl mx-auto">
            Selamat datang di portal informasi resmi Pekan Perlombaan PMR (P3K) KSR PMI 
            Unit Universitas Suryakancana Tingkat Wira dan Madya Se-Wilayah Provinsi Jawa Barat
            Se-Jawa Barat.
            
          </p>
          <p className="text-gray-600 md:text-lg max-w-2xl mx-auto">Temukan semua detail penting tentang acara ini di bawah.</p>
        </motion.div>

        {/* Informasi Kegiatan Card */}
        <motion.div variants={fadeInUp}>
          <Card className="rounded-xl border border-gray-200/70 bg-white">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-blue-600">
                <Info className="w-6 h-6" />
                <h2 className="text-xl font-semibold">Detail Kegiatan</h2>
              </div>
              
              <div className="space-y-3">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-medium text-blue-800">Pekan Perlombaan PMR (P3K) KSR PMI Unit Universitas Suryakancana</p>
                  <p className="text-sm text-blue-600 mt-1">Tingkat Wira dan Madya Se-Wilayah Provinsi Jawa Barat</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-600">Tema Kegiatan:</p>
                  <p className="text-gray-800 font-semibold">Golden Hours, Spread Knowledge and Save Lives</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Timeline Section */}
        <motion.div variants={fadeInUp}>
          <Card className="rounded-xl border border-gray-200/70 bg-white">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-green-600">
                <CalendarDays className="w-6 h-6" />
                <h2 className="text-xl font-semibold">Jadwal Lengkap</h2>
              </div>
              <p className="text-m font-regular text-grey-200">Setiap mata lomba berlangsung di waktu yang sama</p>
              <div className="space-y-4">
                <TimelineItem 
                  date="Jumat, 30 Mei 2025"
                  time="08.00 - 16.30 WIB"
                  title="Hari Pertama"
                  items={['Pendaftaran Ulang', 'Upacara Pembukaan', 'Lomba Poster', 'PMR Cerdas', 'Mojang Jajaka']}
                />

                <TimelineItem 
                  date="Sabtu, 31 Mei 2025"
                  time="08.00 - 16.30 WIB"
                  title="Hari Kedua"
                  items={['Pendaftaran Ulang', 'Pertolongan Pertama', 'Lomba Tandu Putra & Putri']}
                  accent="purple"
                />

                <TimelineItem 
                  date="Minggu, 1 Juni 2025"
                  time="08.00 - 16.30 WIB"
                  title="Hari Ketiga"
                  items={['Pendaftaran Ulang', 'Senam Poco-Poco', 'Unjuk Kabisa Mojang Jajaka', 'Pengumuman Pemenang']}
                  accent="orange"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Dokumen Section */}
        <motion.div variants={fadeInUp}>
          <Card className="rounded-xl border border-gray-200/70 bg-white">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-purple-600">
                <FileText className="w-6 h-6" />
                <h2 className="text-xl font-semibold">Dokumen Penting</h2>
              </div>
              
              <div className="grid gap-3 md:grid-cols-2">
                <DocumentButton 
                  icon={<Download className="w-5 h-5" />}
                  title="Panduan Lomba Hasil Technical Meeting"
                  description="Download Juklak & Juknis"
                  href="https://drive.google.com/drive/folders/1HAsBXoPitXxJXpGss1smselXrWCHH5Jo"
                />

                <DocumentButton 
                  icon={<ListChecks className="w-5 h-5" />}
                  title="Daftar Perlengkapan"
                  description="Isi Tas Pertolongan Pertama"
                  href="https://drive.google.com/drive/folders/1HAsBXoPitXxJXpGss1smselXrWCHH5Jo"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Link Section */}
        <motion.div variants={fadeInUp}>
          <Card className="rounded-xl border border-gray-200/70 bg-white">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-orange-600">
                <Link2 className="w-6 h-6" />
                <h2 className="text-xl font-semibold">Link Penting</h2>
              </div>
              
              <div className="grid gap-3 md:grid-cols-2">
                <LinkButton 
                  icon={<Users className="w-5 h-5" />}
                  title="Grup Peserta"
                  description="WhatsApp Group"
                  href="https://chat.whatsapp.com/LV2Q7IEeT7wDyJCkaZqC7n"
                />

                <LinkButton 
                  icon={<ClipboardList className="w-5 h-5" />}
                  title="Pendaftaran"
                  description="Daftar Sekarang"
                  href="/daftar"
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Timeline Component
const TimelineItem = ({ date, time, title, items, accent = 'blue' }: any) => (
  <div className="flex gap-4">
    <div className={`w-1 rounded-full bg-${accent}-200`} />
    <div className="flex-1">
      <div className="mb-2">
        <p className="font-medium text-gray-900">{date}</p>
        <p className="text-sm text-gray-500">{time}</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className={`font-semibold text-${accent}-600 mb-2`}>{title}</h4>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {items.map((item: string, idx: number) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

// Document Button Component
const DocumentButton = ({ icon, title, description, href }: any) => (
  <Button
    asChild
    variant="outline"
    className="h-auto p-4 text-left hover:bg-gray-50 transition-colors"
  >
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-4"
    >
      <div className={`p-2 rounded-lg bg-blue-100 text-blue-600`}>
        {icon}
      </div>
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </a>
  </Button>
);

// Link Button Component
const LinkButton = ({ icon, title, description, href }: any) => (
  <Button
    asChild
    variant="outline"
    className="h-auto p-4 text-left hover:bg-gray-50 transition-colors"
  >
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-4"
    >
      <div className={`p-2 rounded-lg bg-orange-100 text-orange-600`}>
        {icon}
      </div>
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </a>
  </Button>
);