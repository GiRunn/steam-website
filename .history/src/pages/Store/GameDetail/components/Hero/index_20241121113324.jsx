import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Image as ImageIcon, Star } from 'lucide-react';

const Hero = ({ game }) => {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="relative h-[80vh] overflow-hidden">
      {/* 背景媒体 */}
      <div className="absolute inset-0">
        {showVideo ? (
          <div className="w-full h-full">
            <iframe 
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              className="w-full h-full object-cover"
              allowFullScreen
            />
          </div>
        ) : (
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
            src={game.image}
            alt={game.title}
            className="w-full h-full object-cover"
          />
        )}
        
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f16] via-[#0a0f16]/50 to-transparent" />
      </div>

      {/* 内容区域 */}
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {game.title}
          </h1>
          
          {/* 标签 */}
          <div className="flex flex-wrap gap-2 mb-6">
            {game.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-sm bg-white/10 text-gray-200
                  backdrop-blur-sm border border-white/10"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* 评分 */}
          <div className="flex items-center gap-8 mb-8">
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400 fill-current" />
              <span className="text-2xl font-bold text-white">{game.rating}</span>
            </div>
            <div className="text-gray-400">
              {game.reviews.total.toLocaleString()} 条评价
            </div>
          </div>

          {/* 按钮组 */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowVideo(!showVideo)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600
                text-white font-medium flex items-center gap-2 hover:from-blue-500 
                hover:to-purple-500 transition-colors"
            >
              {showVideo ? <ImageIcon className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span>{showVideo ? '查看截图' : '预告片'}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-xl bg-white/10 text-white font-medium
                hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              了解更多
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;