// app/api/notifikasi/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { namaSekolah, pembina, whatsapp, buktiUrl, namaPengirim } = body;

    const adminPhone = "6285603105234";
    const apiKey = "6705715";
    const pesan = `📢 *Pendaftar Baru!*\n\n🏫 *${namaSekolah}*\n👤 Pembina: ${pembina}\n📱 WA: ${whatsapp}\n📎 Bukti: ${buktiUrl}\n👤 Nama Pengirim: ${namaPengirim}\n\nHarap verifikasi pembayaran.`;

    const result = await fetch(`https://api.callmebot.com/whatsapp.php?phone=${adminPhone}&text=${encodeURIComponent(pesan)}&apikey=${apiKey}`);

    if (!result.ok) {
      return NextResponse.json({ error: 'Gagal mengirim WhatsApp' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Gagal fetch' }, { status: 500 });
  }
}

