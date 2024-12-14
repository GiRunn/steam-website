import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Eye, ThumbsUp, Clock, Share, Bookmark } from 'lucide-react';
import { Tooltip } from '../../../components/ui/Tooltip';
import { Toast } from '../../../components/ui/Toast';

const VideoCard = ({ video, viewMode, onPlay, isPlaying }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: video.title,
        text: video.description,
        url: window.location.href
      });
    } catch (error) {
      navigator.clipboard.writeText(window.location.href);
      Toast.success('链接已复制到剪贴板');
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    Toast.success(isBookmarked ? '已取消收藏' : '已添加到收藏');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: viewMode === 'grid' ? 1.02 : 1 }}
      className={`bg-[#1a1f2e] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all ${
        viewMode === 'list' ? 'flex gap-6' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 缩略图容器 */}
      <div
        className={`relative ${
          viewMode === 'list'
            ? 'w-[480px] flex-shrink-0'
            : 'w-full'
        }`}
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full aspect-video object-cover"
          style={{ minHeight: viewMode === 'grid' ? '240px' : '270px' }}
          loading="lazy"
        />

        {/* 播放按钮 */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onPlay}
          className="absolute inset-0 flex items-center justify-center bg-black/50 group"
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

        {/* 收藏按钮 */}
        <Tooltip content={isBookmarked ? "取消收藏" : "添加到收藏"}>
          <button
            onClick={handleBookmark}
            className="absolute top-3 right-3 p-2 bg-black/80 rounded-full hover:bg-blue-500 transition-colors"
          >
            <Bookmark
              className={`w-5 h-5 ${isBookmarked ? 'text-yellow-400' : 'text-white'}`}
              fill={isBookmarked ? 'currentColor' : 'none'}
            />
          </button>
        </Tooltip>
      </div>

      {/* 视频信息 */}
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-xl font-medium text-white hover:text-blue-400 transition-colors">
            {video.title}
          </h3>
          
          {/* 分享按钮 */}
          <Tooltip content="分享">
            <button
              onClick={handleShare}
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <Share className="w-5 h-5 text-gray-400" />
            </button>
          </Tooltip>
        </div>

        <p className="mt-3 text-gray-400 text-base line-clamp-2">
          {video.description}
        </p>

        {/* 标签 */}
        <div className="mt-4 flex flex-wrap gap-2">
          {video.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 bg-[#252b3b] rounded-full text-sm text-gray-400"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 统计信息 */}
        <div className="mt-5 flex items-center gap-6 text-sm text-gray-400">
          <Tooltip content="观看次数">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              <span>{video.views.toLocaleString()}</span>
            </div>
          </Tooltip>
          
          <Tooltip content="点赞数">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-5 h-5" />
              <span>{video.likes.toLocaleString()}</span>
            </div>
          </Tooltip>
          
          <Tooltip content="发布时间">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{new Date(video.date).toLocaleDateString()}</span>
            </div>
          </Tooltip>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoCard;