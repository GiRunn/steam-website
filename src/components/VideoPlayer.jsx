// src/pages/home/components/VideoPlayer.jsx

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';

// 加载指示器组件
const LoadingIndicator = () => (
  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
    <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
  </div>
);

// 标题栏组件
const TitleBar = ({ title, description }) => (
  <div 
    className="absolute left-0 right-0 top-0 bg-gradient-to-b from-black/80 p-4 text-white"
    onClick={e => e.stopPropagation()}
  >
    <h3 className="text-xl font-bold">{title}</h3>
    {description && (
      <p className="mt-2 text-sm text-gray-300">{description}</p>
    )}
  </div>
);

TitleBar.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string
};

// 视频内容组件
const VideoContent = ({ videoUrl, onLoadEnd }) => {
  // 获取视频类型和ID
  const getVideoType = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    if (url.includes('bilibili.com')) {
      return 'bilibili';
    }
    return 'direct';
  };

  const getYoutubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getBilibiliVideoId = (url) => {
    const regExp = /^.*(?:bilibili.com\/video\/(BV[\w]+)|aid=(\d+))/;
    const match = url.match(regExp);
    return match ? match[1] || match[2] : null;
  };

  const videoType = getVideoType(videoUrl);

  switch (videoType) {
    case 'youtube': {
      const youtubeId = getYoutubeVideoId(videoUrl);
      return (
        <iframe
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&controls=1`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={onLoadEnd}
        />
      );
    }
    case 'bilibili': {
      const bilibiliId = getBilibiliVideoId(videoUrl);
      return (
        <iframe
          className="h-full w-full"
          src={`//player.bilibili.com/player.html?bvid=${bilibiliId}&autoplay=1`}
          scrolling="no"
          border="0"
          frameBorder="no"
          framespacing="0"
          allowFullScreen
          onLoad={onLoadEnd}
        />
      );
    }
    default:
      return (
        <video
          className="h-full w-full"
          controls
          autoPlay
          onLoadedData={onLoadEnd}
        >
          <source src={videoUrl} type="video/mp4" />
          您的浏览器不支持视频播放
        </video>
      );
  }
};

VideoContent.propTypes = {
  videoUrl: PropTypes.string.isRequired,
  onLoadEnd: PropTypes.func.isRequired
};

// 关闭按钮组件
const CloseButton = ({ onClose }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClose();
    }}
    className="absolute right-4 top-4 z-20 rounded-full bg-black/20 p-2 transition-colors hover:bg-black/40"
  >
    <X className="h-6 w-6 text-white" />
  </button>
);

CloseButton.propTypes = {
  onClose: PropTypes.func.isRequired
};

// 主视频播放器组件
export const VideoPlayer = ({ 
  videoUrl, 
  onClose,
  title,
  description 
}) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[90vw] overflow-hidden rounded-xl bg-black shadow-2xl"
        style={{ 
          aspectRatio: '16/9',
          maxHeight: '85vh'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="group relative h-full w-full" onClick={e => e.stopPropagation()}>
          {isLoading && <LoadingIndicator />}
          
          <VideoContent
            videoUrl={videoUrl}
            onLoadEnd={() => setIsLoading(false)}
          />

          <CloseButton onClose={onClose} />
        </div>

        {title && <TitleBar title={title} description={description} />}
      </div>
    </motion.div>
  );
};

VideoPlayer.propTypes = {
  videoUrl: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  description: PropTypes.string
};

export default VideoPlayer;