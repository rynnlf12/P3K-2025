// app/api/notifikasi/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const body = await req.json();
    const { namaSekolah, pembina, whatsapp, buktiUrl, namaPengirim } = body;

    const adminPhone = "6288802017127";
    const apiKey = "6243451";
    const pesan = `📢 *Pendaftar Baru!*\n\n🏫 *${namaSekolah}*\n👤 Pembina: ${pembina}\n📱 WA: ${whatsapp}\n📎 Bukti: ${buktiUrl}\n👤 Nama Pengirim: ${namaPengirim}\n\nHarap verifikasi pembayaran.`;

    const result = await fetch(`https://api.callmebot.com/whatsapp.php?phone=${adminPhone}&text=${encodeURIComponent(pesan)}&apikey=${apiKey}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
  
    if (!result.ok) {
      return NextResponse.json({ error: 'Gagal mengirim WhatsApp' }, { status: 500 });
    }
  
    return NextResponse.json({ success: true });
  } catch (_) {
    clearTimeout(timeout);
    return NextResponse.json({ error: 'Gagal fetch CallMeBot' }, { status: 500 });
  }
}

