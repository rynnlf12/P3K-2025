// File: src/app/api/kwitansi/route.ts

import { NextRequest, NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'

export async function POST(req: NextRequest) {
  try {
    // Mengambil data dari request body
    const data = await req.json()

    // Membuat instance PDFDocument
    const doc = new PDFDocument()
    const chunks: Buffer[] = [] // Ubah tipe array ke Buffer[]

    // Mengumpulkan data PDF menjadi array chunks
    doc.on('data', (chunk: Buffer) => chunks.push(chunk)) // Tambahkan tipe Buffer pada parameter
    doc.on('end', () => {})

    // Header - Judul Kwitansi
    doc.fontSize(16).text('Kwitansi Pembayaran', { align: 'center' })
    doc.moveDown()

    // Menampilkan informasi Sekolah dan Pengirim
    doc.fontSize(12).text(`Nama Sekolah: ${data.nama_sekolah}`)
    doc.text(`Nama Pengirim: ${data.nama_pengirim}`)
    doc.text(`WhatsApp: ${data.whatsapp}`)
    doc.text(`Kategori: ${data.kategori}`)
    doc.moveDown()

    // Menampilkan total pembayaran
    doc.text(`Total: Rp ${Number(data.total).toLocaleString('id-ID')}`)
    doc.moveDown()

    // Menampilkan rincian biaya
    doc.text('Rincian Lomba:')
    data.rincian.forEach((r: any) => {
      doc.text(`- ${r.nama} x ${r.jumlah} tim = Rp ${(r.jumlah * r.biaya).toLocaleString('id-ID')}`)
    })

    // Mengakhiri PDF
    doc.end()

    // Menggabungkan semua chunks menjadi buffer
    const buffer = Buffer.concat(chunks)

    // Mengirimkan PDF sebagai response dengan header yang sesuai
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=kwitansi_${data.nama_sekolah}_${data.kode_unit}.pdf`,
      },
    })
  } catch (err) {
    console.error('PDF generation error:', err)
    return new NextResponse(
      JSON.stringify({ error: 'Gagal membuat PDF' }),
      { status: 500 }
    )
  }
}