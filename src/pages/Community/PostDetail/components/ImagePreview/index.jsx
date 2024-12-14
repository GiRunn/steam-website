// src/pages/Community/PostDetail/components/ImagePreview/index.jsx
import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import PropTypes from 'prop-types';

const ImagePreview = ({ src, alt, onClose }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <div className="absolute top-4 right-4 flex space-x-2">
        <button
          onClick={e => {
            e.stopPropagation();
            handleZoomIn();
          }}
          className="p-2 bg-gray-800/50 rounded-full hover:bg-gray-700/50 transition-colors"
          aria-label="放大"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={e => {
            e.stopPropagation();
            handleZoomOut();
          }}
          className="p-2 bg-gray-800/50 rounded-full hover:bg-gray-700/50 transition-colors"
          aria-label="缩小"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={e => {
            e.stopPropagation();
            handleRotate();
          }}
          className="p-2 bg-gray-800/50 rounded-full hover:bg-gray-700/50 transition-colors"
          aria-label="旋转"
        >
          <RotateCw className="w-5 h-5" />
        </button>
        <button
          onClick={onClose}
          className="p-2 bg-gray-800/50 rounded-full hover:bg-gray-700/50 transition-colors"
          aria-label="关闭预览"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div 
        className="absolute inset-0 flex items-center justify-center"
        onClick={e => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-h-[90vh] max-w-[90vw] object-contain transition-transform duration-200"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`
          }}
        />
      </div>
    </div>
  );
};

ImagePreview.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  onClose: PropTypes.func.isRequired
};

export default ImagePreview;