import { useEffect, useRef, useState } from 'react';

let html5QrCodeInstance = null; // Global instance untuk prevent duplikat

export default function Html5QrcodePlugin({ 
  fps = 10, 
  qrbox = 250, 
  disableFlip = false, 
  qrCodeSuccessCallback, 
  qrCodeErrorCallback 
}) {
  const containerRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load library jika belum ada
    if (typeof window.Html5Qrcode === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.4/html5-qrcode.min.js';
      script.async = true;
      script.onload = () => {
        setTimeout(initializeScanner, 100);
      };
      script.onerror = () => {
        setErrorMsg('Gagal memuat library QR scanner');
        setLoading(false);
      };
      document.head.appendChild(script);
    } else {
      // Library sudah loaded
      setTimeout(initializeScanner, 100);
    }

    return () => {
      // Cleanup: stop scanner saat unmount
      if (html5QrCodeInstance) {
        try {
          html5QrCodeInstance.stop();
          html5QrCodeInstance = null;
        } catch (e) {
          console.error('Error stopping scanner:', e);
        }
      }
    };
  }, []);

  const initializeScanner = () => {
    // Jangan initialize jika sudah ada instance atau container tidak ready
    if (!containerRef.current || html5QrCodeInstance) {
      return;
    }

    try {
      const Html5Qrcode = window.Html5Qrcode;
      if (!Html5Qrcode) {
        setErrorMsg('Library QR scanner tidak tersedia');
        setLoading(false);
        return;
      }

      const scannerId = 'html5-qrcode-scanner';
      
      // Hapus element lama jika ada
      const existingElement = document.getElementById(scannerId);
      if (existingElement) {
        existingElement.remove();
      }

      // Buat container baru
      const scannerContainer = document.createElement('div');
      scannerContainer.id = scannerId;
      scannerContainer.style.width = '100%';
      scannerContainer.style.height = '100%';
      containerRef.current.appendChild(scannerContainer);

      // Create instance
      html5QrCodeInstance = new Html5Qrcode(scannerId, { 
        formFactor: 'portrait',
        useBarCoderEngine: false
      });

      const config = {
        fps: fps,
        qrbox: { width: qrbox, height: qrbox },
        aspectRatio: 1.0,
        disableFlip: disableFlip
      };

      // Start scanning
      html5QrCodeInstance.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          if (qrCodeSuccessCallback) {
            qrCodeSuccessCallback(decodedText);
          }
        },
        () => {} // Silent error handling
      ).then(() => {
        setIsInitialized(true);
        setErrorMsg(null);
        setLoading(false);
      }).catch((error) => {
        console.error('Error starting scanner:', error);
        html5QrCodeInstance = null;
        setErrorMsg('Tidak bisa akses kamera. Periksa permission browser.');
        setLoading(false);
        if (qrCodeErrorCallback) {
          qrCodeErrorCallback(error.message);
        }
      });
    } catch (error) {
      console.error('QR Scanner error:', error);
      html5QrCodeInstance = null;
      setErrorMsg('Error: ' + error.message);
      setLoading(false);
    }
  };

  if (errorMsg) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700 text-sm font-medium">⚠️ {errorMsg}</p>
        <p className="text-red-600 text-xs mt-2">
          Gunakan pencarian manual atau masukkan kode tools
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      style={{
        width: '100%',
        aspectRatio: '1/1',
        maxWidth: '400px',
        margin: '0 auto',
        backgroundColor: '#000',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-400 border-t-blue-600"></div>
          <p className="text-gray-300 text-sm mt-3">Membuka kamera...</p>
        </div>
      )}
    </div>
  );
}

