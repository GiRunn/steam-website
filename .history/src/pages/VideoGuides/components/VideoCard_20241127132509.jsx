// E:\Steam\steam-website\src\pages\VideoGuides\components\VideoCard.jsx
// 用途：单个视频卡片的展示组件，包含视频的缩略图、标题、描述等信息

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Eye, ThumbsUp, Clock, Tag } from 'lucide-react';
import { VIEW_MODES } from '../constants';
import VideoPlayer from '../../../components/VideoPlayer';

const VideoCard = ({ video, viewMode, onPlay, isPlaying }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  
  // 处理视频点击
  const handleVideoClick = useCallback(() => {
    setShowVideoPlayer(true);
    onPlay?.(video.id);
    
    // 更新观看次数
    fetch(`/api/videos/views/${video.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }).catch(console.error);
  }, [video.id, onPlay]);

  // 处理视频关闭
  const handleCloseVideo = useCallback(() => {
    setShowVideoPlayer(false);
    onPlay?.(null);
  }, [onPlay]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: viewMode === VIEW_MODES.GRID ? 1.02 : 1 }}
        className={`group bg-gradient-to-br from-[#1e2837] to-[#0a0f16] rounded-xl overflow-hidden shadow-lg 
          border border-white/5 backdrop-blur-sm transition-all duration-300
          ${viewMode === VIEW_MODES.LIST ? 'flex gap-6' : ''}
          ${isHovered ? 'border-blue-500/30 shadow-blue-500/10' : ''}
        `}
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
            loading="lazy"
            className="w-full aspect-video object-cover transform transition-transform duration-500 group-hover:scale-105"
            style={{ minHeight: viewMode === VIEW_MODES.GRID ? '240px' : '270px' }}
          />
          
          {/* 渐变叠加层 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* 播放按钮 */}
          <motion.button
            initial={false}
            animate={{ 
              opacity: isHovered ? 1 : 0,
              scale: isHovered ? 1 : 0.8 
            }}
            transition={{ duration: 0.2 }}
            onClick={handleVideoClick}
            className="absolute inset-0 flex items-center justify-center group/btn"
            aria-label={isPlaying ? "暂停视频" : "播放视频"}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl scale-150 animate-pulse" />
              <div className={`w-16 h-16 flex items-center justify-center rounded-full
                bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg
                transform transition-all duration-300
                group-hover/btn:from-blue-400 group-hover/btn:to-blue-500
              `}>
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-white" />
                ) : (
                  <Play className="w-8 h-8 text-white translate-x-0.5" />
                )}
              </div>
            </div>
          </motion.button>

          {/* 时长标签 */}
          <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/80 backdrop-blur-sm 
            rounded-md text-sm font-medium border border-white/10">
            {video.duration}
          </div>
        </div>

        {/* 视频信息 */}
        <div className="p-6 flex-1">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent
            hover:from-blue-400 hover:to-blue-500 transition-all duration-300">
            {video.title}
          </h3>
          
          <p className="mt-3 text-gray-400/90 text-base line-clamp-2 leading-relaxed">
            {video.description}
          </p>
          
          {/* 标签列表 */}
          <div className="mt-4 flex flex-wrap gap-2">
            {video.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 bg-white/5 rounded-full text-sm text-gray-400/90
                  border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5
                  transition-colors duration-300 flex items-center gap-1.5"
              >
                <Tag className="w-3.5 h-3.5 opacity-60" />
                {tag}
              </span>
            ))}
          </div>

          {/* 统计信息 */}
          <div className="mt-5 flex items-center gap-6 text-sm text-gray-400/80">
            <div className="flex items-center gap-2 hover:text-blue-400 transition-colors">
              <Eye className="w-5 h-5 opacity-75" />
              <span>{video.views.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 hover:text-blue-400 transition-colors">
              <ThumbsUp className="w-5 h-5 opacity-75" />
              <span>{video.likes.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 hover:text-blue-400 transition-colors">
              <Clock className="w-5 h-5 opacity-75" />
              <span>{new Date(video.date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 视频播放器弹窗 */}
      {showVideoPlayer && (
        <VideoPlayer
          isOpen={showVideoPlayer}
          onClose={handleCloseVideo}
          videoData={{
            title: video.title,
            description: video.description,
            sources: [
              {
                src: video.videoUrl,
                type: 'video/mp4',
                quality: '1080p'
              },
              ...Object.entries(video.quality || {}).map(([quality, url]) => ({
                src: url,
                type: 'video/mp4',
                quality
              }))
            ],
            thumbnail: video.thumbnail,
            duration: video.duration
          }}
          onEnded={() => {
            console.log('Video ended');
          }}
          onError={(error) => {
            console.error('Video playback error:', error);
          }}
        />
      )}
    </>
  );
};

export default VideoCard;