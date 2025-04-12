importScripts('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

self.onmessage = function(e) {
  console.log('[Worker] Menerima data:', e.data);
  
  try {
    const { jsPDF } = self.jspdf;
    console.log('[Worker] JSPDF loaded:', !!jsPDF);
    const doc = new jsPDF({
      unit: 'in',
      format: 'letter',
      orientation: 'portrait'
    });

    doc.text("TEST PDF", 1, 1);

    console.log('[Worker] Membuat dokumen baru');
    
    // Konten PDF
    doc.setFontSize(16);
    doc.text('KWITANSI PEMBAYARAN', 1, 1);
    const content = [
        `Kode Unit: ${data.kode_unit}`,
        `Nama Sekolah: ${data.nama_sekolah}`,
        `Nama Pengirim: ${data.nama_pengirim}`,
        `WhatsApp: ${data.whatsapp}`,
        `Kategori: ${data.kategori}`,
        `Total Biaya: Rp ${data.total}`
      ];
    
      content.forEach(line => {
        doc.text(line, 0.5, yPosition);
        yPosition += lineHeight;
      });
    
    // Data dari komponen
    const data = e.data.data;
    let yPos = 2;
    
    Object.entries(data).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, 1, yPos);
      yPos += 0.5;
    });

    const pdfBlob = doc.output('blob', { type: 'application/pdf' });
    console.log('[Worker] PDF blob created:', pdfBlob);
    
    self.postMessage({ pdfBlob });
  } catch (error) {
    console.error('[Worker Error]', error);
    self.postMessage({ error: error.toString() });
  } finally {
    self.close();
  }
};