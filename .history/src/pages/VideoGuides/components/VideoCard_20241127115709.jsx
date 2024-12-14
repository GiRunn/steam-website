// E:\Steam\steam-website\src\pages\VideoGuides\components\VideoCard.jsx
// 用途：单个视频卡片的展示组件，包含视频的缩略图、标题、描述等信息

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Eye, ThumbsUp, Clock } from 'lucide-react';
import { VIEW_MODES } from '../constants';

const VideoCard = ({ video, viewMode, onPlay, isPlaying }) => {
  const [isHovered, setIsHovered] = useState(false);

  // 图片懒加载配置
  const imgLoading = "lazy";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: viewMode === VIEW_MODES.GRID ? 1.02 : 1 }}
      className={`bg-[#1e2837] rounded-xl overflow-hidden ${
        viewMode === VIEW_MODES.LIST ? 'flex gap-6' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 缩略图区域 */}
      <div className={`relative ${
        viewMode === VIEW_MODES.LIST 
          ? 'w-[480px] flex-shrink-0'
          : 'w-full'
      }`}>
        <img
          src={video.thumbnail}
          alt={video.title}
          loading={imgLoading}
          className="w-full aspect-video object-cover"
          style={{ minHeight: viewMode === VIEW_MODES.GRID ? '240px' : '270px' }}
        />
        
        {/* 播放按钮 */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onPlay}
          className="absolute inset-0 flex items-center justify-center bg-black/50 group"
          aria-label={isPlaying ? "暂停视频" : "播放视频"}
        >
          {isPlaying ? (
            <Pause className="w-16 h-16 text-white group-hover:text-blue-400 transition-colors" />
          ) : (
            <Play className="w-16 h-16 text-white group-hover:text-blue-400 transition-colors" />
          )}
        </motion.button>

        {/* 时长标签 */}
        <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/80 rounded-md text-sm font-medium">
          {video.duration}
        </div>
      </div>

      {/* 视频信息 */}
      <div className="p-6 flex-1">
        <h3 className="text-xl font-medium text-white hover:text-blue-400 transition-colors">
          {video.title}
        </h3>
        <p className="mt-3 text-gray-400 text-base line-clamp-2">
          {video.description}
        </p>
        
        {/* 标签列表 */}
        <div className="mt-4 flex flex-wrap gap-2">
          {video.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 bg-white/5 rounded-full text-sm text-gray-400"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 统计信息 */}
        <div className="mt-5 flex items-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            <span>{video.views.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <ThumbsUp className="w-5 h-5" />
            <span>{video.likes.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span>{new Date(video.date).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoCard;