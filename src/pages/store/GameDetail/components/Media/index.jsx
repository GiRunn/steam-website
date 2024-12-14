// src/pages/store/GameDetail/components/Media/index.jsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Image as ImageIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Gallery from './Gallery';
import VideoPlayer from '../../../../../components/VideoPlayer';

// 视频卡片组件
const VideoCard = ({ videoUrl, thumbnailUrl, onPlay }) => {
  return (
    <div 
      className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group"
      onClick={onPlay}
    >
      {/* 缩略图 */}
      <img 
        src={thumbnailUrl} 
        alt="Video thumbnail" 
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      
      {/* 播放按钮遮罩 */}
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-white/20 p-4 rounded-full backdrop-blur-sm"
        >
          <Play className="w-12 h-12 text-white" />
        </motion.div>
      </div>
    </div>
  );
};

// 图片预览组件
const ImageViewer = ({ screenshots, selectedImage, setSelectedImage, setShowLightbox }) => {
  return (
    <div className="space-y-4">
      {/* 大图预览 */}
      <div className="relative aspect-video rounded-xl overflow-hidden group">
        <motion.img
          key={selectedImage}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          src={screenshots[selectedImage]}
          alt={`Screenshot ${selectedImage + 1}`}
          className="w-full h-full object-cover"
          onClick={() => setShowLightbox(true)}
        />
        
        {/* 切换按钮 */}
        <NavButtons 
          selectedImage={selectedImage} 
          setSelectedImage={setSelectedImage}
          maxLength={screenshots.length}
        />
      </div>

      {/* 缩略图列表 */}
      <Gallery 
        images={screenshots}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
      />
    </div>
  );
};

// 导航按钮组件
const NavButtons = ({ selectedImage, setSelectedImage, maxLength }) => {
  return (
    <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedImage((prev) => prev === 0 ? maxLength - 1 : prev - 1);
        }}
        className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedImage((prev) => prev === maxLength - 1 ? 0 : prev + 1);
        }}
        className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </motion.button>
    </div>
  );
};

// Lightbox 组件
const Lightbox = ({ isOpen, onClose, image, alt }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </motion.button>
          
          <img
            src={image}
            alt={alt}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 主组件
const Media = ({ game }) => {
  const [currentMedia, setCurrentMedia] = useState('screenshots');
  const [selectedImage, setSelectedImage] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  // 模拟截图数据
  const screenshots = [
    game.image,
    game.image,
    game.image,
    game.image,
    game.image,
  ];

  return (
    <section className="space-y-8">
      {/* 标题和切换按钮 */}
      <div className="flex items-center justify-between">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-white"
        >
          游戏媒体
        </motion.h2>

        <div className="flex items-center gap-4">
          {[
            { id: 'screenshots', label: '截图', icon: ImageIcon },
            { id: 'video', label: '视频', icon: Play }
          ].map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentMedia(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                ${currentMedia === item.id 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                  : 'bg-white/10 text-gray-400 hover:text-white'}`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* 媒体内容 */}
      <AnimatePresence mode="wait">
        {currentMedia === 'screenshots' ? (
          <motion.div
            key="screenshots"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <ImageViewer 
              screenshots={screenshots}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              setShowLightbox={setShowLightbox}
            />
          </motion.div>
        ) : (
          <motion.div
            key="video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <VideoCard 
              videoUrl={game.videoUrl}
              thumbnailUrl={game.image} // 使用游戏图片作为视频封面
              onPlay={() => setShowVideoPlayer(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 图片全屏预览 */}
      <Lightbox 
        isOpen={showLightbox}
        onClose={() => setShowLightbox(false)}
        image={screenshots[selectedImage]}
        alt={`Screenshot ${selectedImage + 1}`}
      />

      {/* 视频播放器 */}
      <AnimatePresence>
        {showVideoPlayer && (
          <VideoPlayer 
            videoUrl={game.videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ"}
            title={game.title}
            description="游戏预告片"
            onClose={() => setShowVideoPlayer(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default Media;