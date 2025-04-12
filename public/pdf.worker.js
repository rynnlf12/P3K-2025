importScripts('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

self.onmessage = async function(e) {
  const { data, imgBase64 } = e.data;
  const { jsPDF } = self.jspdf;
  
  const doc = new jsPDF({
    unit: 'in',
    format: 'letter',
    orientation: 'portrait'
  });

  // Add logo
  if(imgBase64) {
    try {
      doc.addImage(imgBase64, 'PNG', 0.5, 0.5, 2, 0.5);
    } catch (error) {
      console.error('Error adding image:', error);
    }
  }
  // Add title
  doc.setFontSize(16);
  doc.text('Kwitansi Pendaftaran', 4, 1, { align: 'right' });

  // Add content
  doc.setFontSize(12);
  let yPosition = 2;
  const lineHeight = 0.5;
  
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

  // Generate blob
  const pdfBlob = doc.output('blob');
  self.postMessage({ pdfBlob });
  self.close();
};