// app/api/notifikasi/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // naikkan timeout jadi 10 detik

  try {
    const body = await req.json();
    console.log('BODY RECEIVED', body);
    const { namaSekolah, pembina, whatsapp, buktiUrl, namaPengirim } = body;

    const adminPhone = "6285603105234";
    const apiKey = "6705715";
    const pesan = `📢 *Pendaftar Baru!*\n\n🏫 *${namaSekolah}*\n👤 Pembina: ${pembina}\n📱 WA: ${whatsapp}\n📎 Bukti: ${buktiUrl}\n👤 Nama Pengirim: ${namaPengirim}\n\nHarap verifikasi pembayaran.`;

    const result = await fetch(
      `https://api.callmebot.com/whatsapp.php?phone=${adminPhone}&text=${encodeURIComponent(pesan)}&apikey=${apiKey}`,
      {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0', // optional tapi aman
        },
      }
    );

    clearTimeout(timeout);

    if (!result.ok) {
      const text = await result.text();
      console.error('WhatsApp API error:', text);
      return NextResponse.json({ error: 'Gagal mengirim WhatsApp', detail: text }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API NOTIFIKASI ERROR', err.name, err.message);
    return NextResponse.json({ error: 'Gagal fetch CallMeBot', detail: err.message }, { status: 500 });
  }
}
