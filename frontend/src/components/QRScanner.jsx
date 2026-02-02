import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRScanner({ onScanSuccess, onError, onClose }) {
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const onScanSuccessRef = useRef(onScanSuccess);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);

  // Keep callback ref updated
  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
  }, [onScanSuccess]);

  useEffect(() => {
    if (scanning && scannerRef.current) {
      const scannerId = scannerRef.current.id || 'qr-reader';
      const html5QrCode = new Html5Qrcode(scannerId);
      html5QrCodeRef.current = html5QrCode;

      html5QrCode
        .start(
          { facingMode: 'environment' }, // Use back camera
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText, decodedResult) => {
            // Success callback - stop scanning first
            const stopAndCallback = async () => {
              try {
                // Stop scanning first to prevent multiple scans
                if (html5QrCodeRef.current) {
                  await html5QrCodeRef.current.stop().catch(() => {});
                  html5QrCodeRef.current.clear();
                }
                setScanning(false);
                
                // Call success callback after cleanup using ref to avoid stale closure
                if (onScanSuccessRef.current && decodedText) {
                  onScanSuccessRef.current(decodedText, decodedResult);
                }
              } catch (error) {
                console.error('Error in QR scan success handler:', error);
                setError('Terjadi kesalahan saat memproses QR code');
                setScanning(false);
                // Still try to call callback if possible
                if (onScanSuccessRef.current && decodedText) {
                  try {
                    onScanSuccessRef.current(decodedText, decodedResult);
                  } catch (callbackError) {
                    console.error('Error in onScanSuccess callback:', callbackError);
                  }
                }
              }
            };
            
            stopAndCallback();
          },
          (errorMessage) => {
            // Error callback - ignore most errors as they're just scanning attempts
            if (errorMessage && !errorMessage.includes('No QR code found') && !errorMessage.includes('NotFoundException')) {
              // Only show persistent errors
              if (errorMessage.includes('Permission') || errorMessage.includes('NotAllowedError')) {
                setError('Akses kamera ditolak. Pastikan izin kamera sudah diberikan.');
              }
            }
          }
        )
        .catch((err) => {
          console.error('Error starting QR scanner:', err);
          setError('Gagal mengakses kamera. Pastikan izin kamera sudah diberikan.');
          setScanning(false);
        });
    }

    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current
          .stop()
          .then(() => {
            if (html5QrCodeRef.current) {
              html5QrCodeRef.current.clear();
            }
          })
          .catch((err) => {
            console.error('Error in cleanup:', err);
            try {
              if (html5QrCodeRef.current) {
                html5QrCodeRef.current.clear();
              }
            } catch (clearErr) {
              console.error('Error clearing in cleanup:', clearErr);
            }
          });
      }
    };
  }, [scanning]);

  const stopScanning = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current
        .stop()
        .then(() => {
          html5QrCodeRef.current.clear();
          setScanning(false);
        })
        .catch((err) => {
          console.error('Error stopping scanner:', err);
          // Force cleanup even if stop fails
          try {
            html5QrCodeRef.current.clear();
          } catch (clearErr) {
            console.error('Error clearing scanner:', clearErr);
          }
          setScanning(false);
        });
    } else {
      setScanning(false);
    }
  };

  const startScan = () => {
    setError(null);
    setScanning(true);
  };

  const handleClose = () => {
    try {
      stopScanning();
    } catch (error) {
      console.error('Error in handleClose:', error);
    } finally {
      if (onClose) {
        try {
          onClose();
        } catch (error) {
          console.error('Error in onClose callback:', error);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Scan QR Code</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <span className="material-icons text-gray-600 dark:text-gray-300">close</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <div className="mb-4">
          {!scanning ? (
            <div className="space-y-4">
              <button
                onClick={startScan}
                className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Mulai Scan QR Code
              </button>
              {error && (
                <button
                  onClick={() => {
                    setError(null);
                    startScan();
                  }}
                  className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Coba Lagi
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div
                id="qr-reader"
                ref={scannerRef}
                className="w-full rounded-lg overflow-hidden"
                style={{ minHeight: '300px' }}
              />
              <button
                onClick={stopScanning}
                className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Stop Scanning
              </button>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
          <p>Posisikan QR code di dalam frame untuk memindai</p>
        </div>
      </div>
    </div>
  );
}

