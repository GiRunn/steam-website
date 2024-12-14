import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Image as ImageIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Gallery from './Gallery';
import VideoPlayer from 'src/components/VideoPlayer';

const Media = ({ game }) => {
  const [currentMedia, setCurrentMedia] = useState('screenshots');
  const [selectedImage, setSelectedImage] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

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
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between
                opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage((prev) => 
                      prev === 0 ? screenshots.length - 1 : prev - 1
                    );
                  }}
                  className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70
                    backdrop-blur-sm transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage((prev) => 
                      prev === screenshots.length - 1 ? 0 : prev + 1
                    );
                  }}
                  className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70
                    backdrop-blur-sm transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            {/* 缩略图列表 */}
            <Gallery 
              images={screenshots}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
            />
          </motion.div>
        ) : (
          <motion.div
            key="video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="aspect-video rounded-xl overflow-hidden bg-black"
          >
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Game Trailer"
              className="w-full h-full"
              allowFullScreen
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 全屏预览 */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center 
              justify-center p-4"
            onClick={() => setShowLightbox(false)}
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white
                hover:bg-white/20 transition-colors"
              onClick={() => setShowLightbox(false)}
            >
              <X className="w-6 h-6" />
            </motion.button>
            
            <img
              src={screenshots[selectedImage]}
              alt={`Screenshot ${selectedImage + 1}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Media;