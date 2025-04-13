import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { kode_unit, nama_sekolah, nama_pengirim, whatsapp, kategori, total, rincian } = data

    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const chunks: Uint8Array[] = []
    doc.on('data', (chunk: Uint8Array) => chunks.push(chunk))
    doc.on('end', () => {})

    doc.fontSize(18).fillColor('#b91c1c').text('Kwitansi Pembayaran', { align: 'center' })
    doc.moveDown()

    doc.fillColor('#000000').fontSize(12)
    doc.text(`Kode Unit: ${kode_unit}`)
    doc.text(`Nama Sekolah: ${nama_sekolah}`)
    doc.text(`Nama Pengirim: ${nama_pengirim}`)
    doc.text(`WhatsApp: ${whatsapp}`)
    doc.text(`Kategori: ${kategori}`)
    doc.moveDown()

    doc.fontSize(14).text('Rincian Biaya:')
    rincian.forEach((item: any) => {
      doc.text(`- ${item.nama} x ${item.jumlah} tim = Rp ${(item.jumlah * item.biaya).toLocaleString('id-ID')}`)
    })
    doc.moveDown()
    doc.fontSize(12).fillColor('#c2410c').text(`Total: Rp ${Number(total).toLocaleString('id-ID')}`, {
      align: 'right',
    })

    doc.moveDown(2)
    doc.fontSize(10).fillColor('#6b7280').text('Dokumen ini dicetak otomatis oleh sistem dan tidak memerlukan tanda tangan.', {
      align: 'center',
    })

    doc.end()
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const buffers: Uint8Array[] = []
      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => resolve(Buffer.concat(buffers)))
      doc.on('error', reject)
    })

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Kwitansi_${nama_sekolah}_${kode_unit}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'Gagal membuat PDF' }, { status: 500 })
  }
}
