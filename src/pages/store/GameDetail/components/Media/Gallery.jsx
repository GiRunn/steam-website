import React from 'react';
import { motion } from 'framer-motion';

const Gallery = ({ images, selectedImage, setSelectedImage }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {images.map((image, index) => (
        <motion.button
          key={index}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedImage(index)}
          className={`relative aspect-video rounded-lg overflow-hidden
            ${selectedImage === index ? 'ring-2 ring-blue-500' : ''}`}
        >
          <img
            src={image}
            alt={`Thumbnail ${index + 1}`}
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 bg-black/50 transition-opacity
            ${selectedImage === index ? 'opacity-0' : 'opacity-50'}`} 
          />
        </motion.button>
      ))}
    </div>
  );
};

export default Gallery;