// File: src/app/api/kwitansi/route.ts

import { NextRequest, NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    const pdfBuffer = await new Promise<Buffer>(async (resolve, reject) => {
      try {
        const doc = new PDFDocument()
        const chunks: Buffer[] = []

        doc.on('data', (chunk: Buffer) => chunks.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(chunks)))
        // Tambahkan tipe eksplisit untuk parameter error
        doc.on('error', (err: Error) => reject(err)) // <-- Perbaikan di sini

        // Header - Judul Kwitansi
        doc.fontSize(16).text('Kwitansi Pembayaran', { align: 'center' })
        doc.moveDown()

        // Informasi Sekolah dan Pengirim
        doc.fontSize(12)
          .text(`Nama Sekolah: ${data.nama_sekolah}`)
          .text(`Nama Pengirim: ${data.nama_pengirim}`)
          .text(`WhatsApp: ${data.whatsapp}`)
          .text(`Kategori: ${data.kategori}`)
          .moveDown()

        // Total pembayaran
        doc.text(`Total: Rp ${Number(data.total).toLocaleString('id-ID')}`)
        doc.moveDown()

        // Rincian biaya
        doc.text('Rincian Lomba:')
        data.rincian.forEach((r: any) => {
          const total = r.jumlah * r.biaya
          doc.text(
            `- ${r.nama} x ${r.jumlah} tim = Rp ${total.toLocaleString('id-ID')}`
          )
        })

        doc.end()
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Unknown error'))
      }
    })

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=kwitansi_${data.nama_sekolah}_${data.kode_unit}.pdf`,
      },
    })
  } catch (err) {
    console.error('PDF generation error:', err)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Gagal membuat PDF',
        message: err instanceof Error ? err.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}