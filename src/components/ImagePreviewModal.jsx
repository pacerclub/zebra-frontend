"use client";

import { Download, X, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

export default function ImagePreviewModal({ isOpen, onClose, imageData, fileName }) {
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  return (
    <div 
      className={`fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 transition-opacity duration-200 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      <div 
        className={`relative max-w-[95vw] max-h-[95vh] bg-black rounded-lg shadow-2xl transition-transform duration-200 ${
          isOpen ? 'scale-100' : 'scale-95'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={imageData}
            alt={fileName}
            className={`w-full h-full object-contain transition-transform duration-200 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            style={{ 
              maxHeight: 'calc(95vh - 4rem)',
              transform: `scale(${scale})`
            }}
            onLoad={() => setIsLoading(false)}
          />
        </div>

        {/* Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
          {/* Left side */}
          <div className="flex items-center gap-2">
            <Button
              onClick={onClose}
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
            <span className="text-white/90 text-sm font-medium ml-2">
              {fileName}
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleZoomOut}
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
              disabled={scale <= 0.5}
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <Button
              onClick={handleZoomIn}
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
              disabled={scale >= 3}
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button
              onClick={handleDownload}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 ml-2"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* Image Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex justify-between items-center text-white/75 text-sm">
            <span>Zoom: {Math.round(scale * 100)}%</span>
            <span>Click outside to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
