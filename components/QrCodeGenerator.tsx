'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCodeStyling, { Options } from 'qr-code-styling';
import { Download, XCircle } from 'lucide-react';

interface CustomQRCodeGeneratorProps {
  url: string;
  formName: string;
  onClose: () => void;
}

const CustomQRCodeGenerator: React.FC<CustomQRCodeGeneratorProps> = ({ url, formName, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [qrCode] = useState(new QRCodeStyling());
  const [downloading, setDownloading] = useState<boolean>(false);

  useEffect(() => {
    if (ref.current) {
      qrCode.append(ref.current);
    }
  }, [qrCode]);

  useEffect(() => {
    const options: Options = {
      width: 300,
      height: 300,
      data: url,
      image: '', // Opsional: Tambahkan URL gambar di tengah QR
      dotsOptions: {
        color: "#000000", // Warna utama dots
        type: "rounded" // Bentuk dots: "square", "dots", "rounded", "classy", "extra-rounded"
      },
      cornersSquareOptions: {
        color: "#000000", // Warna sudut
        type: "extra-rounded" // Bentuk sudut: "square", "dot", "extra-rounded"
      },
      backgroundOptions: {
        color: "#ffffff",
      },
      margin: 10,
      qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: "L"
      }
    };
    qrCode.update(options);
  }, [qrCode, url]);

  const handleDownloadQR = async () => {
    setDownloading(true);
    try {
      await qrCode.download({
        extension: "png",
        name: `${formName.replace(/\s+/g, '-')}-custom-qrcode`,
      });
    } catch (error) {
      console.error("Failed to download QR code:", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full text-center space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
          title="Tutup"
        >
          <XCircle size={24} />
        </button>
        <h3 className="text-xl font-bold text-gray-800 mb-4">QR Code untuk "{formName}"</h3>
        <div ref={ref} className="flex justify-center mb-4">
          {/* QR Code akan dirender di sini */}
        </div>
        <p className="text-sm text-gray-600 break-words mb-4">{url}</p>
        <button
          onClick={handleDownloadQR}
          disabled={downloading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {downloading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Mengunduh...</span>
            </>
          ) : (
            <>
              <Download size={18} />
              <span>Unduh QR Code</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CustomQRCodeGenerator;