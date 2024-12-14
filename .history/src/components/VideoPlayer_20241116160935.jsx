// src/pages/home/components/VideoPlayer.jsx

import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { X, Volume2, VolumeX, Loader2, Maximize2, Minimize2 } from 'lucide-react';

export const VideoPlayer = ({ 
  videoUrl, 
  onClose,
  title,
  description 
}) => {
    
  const videoRef = useRef(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  // 处理全屏
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      if (containerRef.current.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 处理音量变化
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  // 处理静音切换
  const handleMuteToggle = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      if (!newMutedState) {
        videoRef.current.volume = volume;
      }
    }
  };

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

  // 渲染视频内容
  const renderVideoContent = () => {
    const videoType = getVideoType(videoUrl);

    switch (videoType) {
      case 'youtube': {
        const youtubeId = getYoutubeVideoId(videoUrl);
        return (
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
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
            onLoad={() => setIsLoading(false)}
          />
        );
      }
      default:
        return (
          <video
            ref={videoRef}
            className="h-full w-full"
            controls
            autoPlay
            volume={volume}
            muted={isMuted}
            onLoadedData={() => setIsLoading(false)}
          >
            <source src={videoUrl} type="video/mp4" />
            您的浏览器不支持视频播放
          </video>
        );
    }
  };

  // 控制栏组件
  const Controls = () => (
    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/80 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
      <div className="flex items-center gap-4">
        <button
          onClick={handleMuteToggle}
          className="rounded-full bg-white/20 p-2 transition-colors hover:bg-white/30"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-white" />
          ) : (
            <Volume2 className="h-5 w-5 text-white" />
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-white/20"
        />
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={toggleFullscreen}
          className="rounded-full bg-white/20 p-2 transition-colors hover:bg-white/30"
        >
          {isFullscreen ? (
            <Minimize2 className="h-5 w-5 text-white" />
          ) : (
            <Maximize2 className="h-5 w-5 text-white" />
          )}
        </button>
        <button
          onClick={onClose}
          className="rounded-full bg-white/20 p-2 transition-colors hover:bg-white/30"
        >
          <X className="h-5 w-5 text-white" />
        </button>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-[90vw] overflow-hidden rounded-xl bg-black shadow-2xl"
        style={{ 
          aspectRatio: '16/9',
          maxHeight: '85vh'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="group relative h-full w-full">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
              <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
            </div>
          )}
          {renderVideoContent()}
          <Controls />
        </div>
        {title && (
          <div className="absolute left-0 right-0 top-0 bg-gradient-to-b from-black/80 p-4 text-white">
            <h3 className="text-xl font-bold">{title}</h3>
            {description && (
              <p className="mt-2 text-sm text-gray-300">{description}</p>
            )}
          </div>
        )}
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