// src/pages/store/activity-detail/components/MediaGallery/index.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoPlayer from '../../../../../components/VideoPlayer';  // 修改为相对路径
import styles from './styles.module.css';

const MediaGallery = ({ data }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('images'); // 'images' or 'videos'

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      <h2 className="text-3xl font-bold mb-6">活动现场</h2>

      {/* 标签切换 */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('images')}
          className={`px-6 py-2 rounded-full transition-colors ${
            activeTab === 'images' 
              ? 'bg-blue-600 text-white' 
              : 'bg-[#1a1f26] hover:bg-[#252a31]'
          }`}
        >
          图片展示
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-6 py-2 rounded-full transition-colors ${
            activeTab === 'videos' 
              ? 'bg-blue-600 text-white' 
              : 'bg-[#1a1f26] hover:bg-[#252a31]'
          }`}
        >
          视频展示
        </button>
      </div>

      {/* 图片展示区域 */}
      <AnimatePresence mode="wait">
        {activeTab === 'images' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {data.images.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={styles.imageContainer}
                onClick={() => handleImageClick(image)}
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover rounded-lg"
                  loading="lazy"
                />
                <div className={styles.imageOverlay}>
                  <span className="text-white">{image.title}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* 视频展示区域 */}
        {activeTab === 'videos' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {data.videos.map((video, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-[#1a1f26] rounded-lg overflow-hidden"
              >
                <VideoPlayer
                  url={video.url}
                  thumbnail={video.thumbnail}
                  title={video.title}
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{video.title}</h3>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 图片预览模态框 */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.modal}
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              className={styles.modalContent}
              onClick={e => e.stopPropagation()}
            >
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-w-full max-h-[80vh] object-contain"
              />
              <button
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2"
                onClick={closeModal}
              >
                关闭
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default MediaGallery;