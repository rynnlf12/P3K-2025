import { NextRequest, NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'
import path from 'path'
import fs from 'fs'

export async function POST(req: NextRequest) {
  const data = await req.json()

  const doc = new PDFDocument()
  const chunks: Uint8Array[] = []
  doc.on('data', chunk => chunks.push(chunk))
  doc.on('end', () => {})

  const fontPath = path.resolve('./public/fonts/Montserrat-Regular.ttf')
  if (fs.existsSync(fontPath)) {
    doc.registerFont('CustomFont', fontPath)
    doc.font('CustomFont')
  } else {
    console.error('Font not found:', fontPath)
    doc.font('Times-Roman')
  }

  doc.fontSize(16).fillColor('#b91c1c').text('Kwitansi Pembayaran', { align: 'center' })
  doc.moveDown()

  doc.fontSize(12).fillColor('#000000')
  doc.text(`Kode Unit: ${data.kode_unit}`)
  doc.text(`Nama Sekolah: ${data.nama_sekolah}`)
  doc.text(`Nama Pengirim: ${data.nama_pengirim}`)
  doc.text(`WhatsApp: ${data.whatsapp}`)
  doc.text(`Kategori: ${data.kategori}`)
  doc.moveDown()

  doc.fontSize(13).text('Rincian Lomba:')
  doc.moveDown(0.5)
  data.rincian.forEach((r: any) => {
    doc.text(`- ${r.nama} × ${r.jumlah} tim = Rp ${(r.jumlah * r.biaya).toLocaleString('id-ID')}`)
  })

  doc.moveDown()
  doc.fontSize(12).fillColor('#c2410c').text(`Total: Rp ${Number(data.total).toLocaleString('id-ID')}`, {
    align: 'right',
  })

  doc.moveDown(2)
  doc.fontSize(10).fillColor('#6b7280').text('Dokumen ini dicetak otomatis oleh sistem dan tidak memerlukan tanda tangan', {
    align: 'center',
  })

  doc.end()
  const buffer = Buffer.concat(chunks)

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=kwitansi_${data.nama_sekolah}_${data.kode_unit}.pdf`,
    },
  })
}
