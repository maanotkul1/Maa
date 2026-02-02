/**
 * Generate QR code as canvas/image
 * Uses QRCode library
 */
export async function generateQRCode(text, options = {}) {
  try {
    // Dynamically import QRCode library
    const QRCode = (await import('qrcode')).default;
    
    const defaultOptions = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      ...options,
    };

    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(text, defaultOptions);
    return qrDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

/**
 * Download QR code as image
 */
export async function downloadQRCode(text, filename = 'qrcode.png') {
  try {
    const dataUrl = await generateQRCode(text);
    
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading QR code:', error);
    throw error;
  }
}

/**
 * Print QR code
 */
export async function printQRCode(text, title = 'QR Code') {
  try {
    const dataUrl = await generateQRCode(text);
    
    const printWindow = window.open('', '', 'height=400,width=400');
    printWindow.document.write('<html><head><title>' + title + '</title></head><body>');
    printWindow.document.write('<h2>' + title + '</h2>');
    printWindow.document.write('<img src="' + dataUrl + '" />');
    printWindow.document.write('<p>' + text + '</p>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  } catch (error) {
    console.error('Error printing QR code:', error);
    throw error;
  }
}
