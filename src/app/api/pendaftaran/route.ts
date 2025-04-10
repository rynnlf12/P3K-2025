import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.sekolah || !body?.lombaDipilih || !body?.totalBayar) {
      return NextResponse.json(
        { status: 'error', message: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    const result = await prisma.pendaftaran.create({
      data: {
        nama: body.sekolah.nama,
        pembina: body.sekolah.pembina,
        whatsapp: body.sekolah.whatsapp,
        kategori: body.sekolah.kategori,
        lombaJson: JSON.stringify(body.lombaDipilih),
        peserta: JSON.stringify(body.peserta || {}),
        totalBayar: body.totalBayar,
        buktiUrl: body.buktiNamaFile || '',
      },
    });

    return NextResponse.json({ status: 'ok', id: result.id });
  } catch (err) {
    console.error('❌ Gagal menyimpan:', err);
    return NextResponse.json(
      { status: 'error', message: 'Terjadi kesalahan saat menyimpan' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
