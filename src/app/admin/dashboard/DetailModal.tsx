// app/admin/dashboard/DetailModal.tsx
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

type Pendaftar = {
  nama_sekolah: string;
  pembina: string;
  whatsapp: string;
  kategori: string;
  tandu_putra: number;
  tandu_putri: number;
  pertolongan_pertama: number;
  senam_poco_poco: number;
  mojang_jajaka: number;
  poster: number;
  pmr_cerdas: number;
  total: number;
  bukti: string;
  nama_pengirim: string;
  status_verifikasi: string;
};

interface DetailModalProps {
  open: boolean;
  onClose: () => void;
  data: Pendaftar | null;
}

export default function DetailModal({ open, onClose, data }: DetailModalProps) {
  if (!data) return null;

  const kegiatan = [
    { label: 'Tandu Putra', value: data.tandu_putra },
    { label: 'Tandu Putri', value: data.tandu_putri },
    { label: 'Pertolongan Pertama', value: data.pertolongan_pertama },
    { label: 'Senam Poco-Poco', value: data.senam_poco_poco },
    { label: 'Mojang Jajaka', value: data.mojang_jajaka },
    { label: 'Poster', value: data.poster },
    { label: 'PMR Cerdas', value: data.pmr_cerdas },
  ];

  const buktiUrl = data.bukti.startsWith('http')
  ? data.bukti
  : `https://llvesnxqpifjjrcecnxj.supabase.co/storage/v1/object/public/bukti-pembayaran/bukti/${data.bukti}`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detail Pendaftar</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-2">
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground">Sekolah</p>
              <p className="font-medium">{data.nama_sekolah}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">Pembina</p>
                <p className="font-medium">{data.pembina}</p>
              </div>
              <div>
                <p className="text-muted-foreground">No. WhatsApp</p>
                <p className="font-medium">{data.whatsapp}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Kategori</p>
                <Badge variant="outline">{data.kategori}</Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Status Verifikasi</p>
                <Badge
                  variant={
                    data.status_verifikasi === 'verified'
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {data.status_verifikasi}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-muted-foreground">Jumlah Peserta per Lomba</p>
              <div className="grid grid-cols-2 gap-2">
                {kegiatan.map((kegiatan) => (
                  <div key={kegiatan.label} className="flex justify-between">
                    <span>{kegiatan.label}</span>
                    <span className="font-medium">{kegiatan.value}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between mt-2 font-semibold">
                <span>Total Peserta</span>
                <span>{data.total}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-muted-foreground">Dikirim oleh</p>
              <p className="font-medium">{data.nama_pengirim}</p>
            </div>

            <div className="space-y-2">
              <p className="text-muted-foreground">Bukti Pembayaran</p>
              {data.bukti ? (
                <Image
                src={buktiUrl}
                alt="Bukti Pembayaran"
                className="rounded-lg"
                width={500}
                height={300}
              />
              ) : (
                <p className="text-sm text-destructive">Tidak ada bukti</p>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
