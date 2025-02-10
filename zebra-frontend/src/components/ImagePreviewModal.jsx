"use client";

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ImagePreviewModal({ isOpen, onClose, imageData, fileName }) {
  if (!isOpen) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-[90vw] max-h-[90vh] bg-white rounded-lg"
        onClick={e => e.stopPropagation()}
      >
        <img
          src={imageData}
          alt={fileName}
          className="w-full h-full object-contain rounded-lg"
          style={{ maxHeight: 'calc(90vh - 4rem)' }}
        />
        <Button
          onClick={handleDownload}
          className="absolute top-4 right-4"
          variant="secondary"
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        <Button
          onClick={onClose}
          className="absolute top-4 left-4"
          variant="secondary"
          size="sm"
        >
          Close
        </Button>
      </div>
    </div>
  );
}
