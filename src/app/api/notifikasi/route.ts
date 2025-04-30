// app/api/notifikasi/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Gunakan service role key
);

export async function POST(req: Request) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const body = await req.json();
    const { namaSekolah, pembina, whatsapp, buktiUrl, namaPengirim } = body;

    const adminPhone = "6282219244749";
    const apiKey = "8261365";
    const pesan = `📢 *Pendaftar Baru!*\n\n🏫 *${namaSekolah}*\n👤 Pembina: ${pembina}\n📱 WA: ${whatsapp}\n📎 Bukti: ${buktiUrl}\n👤 Nama Pengirim: ${namaPengirim}\n\nHarap verifikasi pembayaran.`;

    const result = await fetch(`https://api.callmebot.com/whatsapp.php?phone=${adminPhone}&text=${encodeURIComponent(pesan)}&apikey=${apiKey}`, {
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!result.ok) {
      // Fallback ke Supabase jika gagal
      await supabase.from('notifikasi_gagal').insert([{
        nama_sekolah: namaSekolah,
        pembina,
        whatsapp,
        bukti_url: buktiUrl,
        nama_pengirim: namaPengirim,
      }]);
      return NextResponse.json({ fallback: true, message: 'Notifikasi gagal dikirim. Disimpan ke fallback.' }, { status: 200 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('API NOTIFIKASI ERROR', err);
    try {
      const body = await req.json();
      await supabase.from('notifikasi_gagal').insert([{
        nama_sekolah: body.namaSekolah,
        pembina: body.pembina,
        whatsapp: body.whatsapp,
        bukti_url: body.buktiUrl,
        nama_pengirim: body.namaPengirim,
      }]);
    } catch (e) {
      console.error('Fallback Supabase insert error:', e);
    }
    return NextResponse.json({ error: 'Gagal fetch CallMeBot, fallback disimpan' }, { status: 200 });
  }
}
