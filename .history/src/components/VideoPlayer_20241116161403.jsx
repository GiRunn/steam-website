// src/pages/home/components/VideoPlayer.jsx

import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { X, Volume2, VolumeX, Loader2, Maximize2, Minimize2 } from 'lucide-react';

// 音量控制样式组件
const VolumeStyles = () => (
  <style>{`
    .volume-slider {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 4px;
      border-radius: 2px;
      background: rgba(255, 255, 255, 0.2);
      outline: none;
      cursor: pointer;
    }
    .volume-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: white;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .volume-slider::-webkit-slider-thumb:hover {
      transform: scale(1.2);
    }
    .volume-slider::-moz-range-thumb {
      width: 12px;
      height: 12px;
      border: none;
      border-radius: 50%;
      background: white;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .volume-slider::-moz-range-thumb:hover {
      transform: scale(1.2);
    }
  `}</style>
);


const VideoStyles = () => (
    <style>{`
      /* 隐藏默认控制器 */
      video::-webkit-media-controls {
        display: none !important;
      }
      video::-webkit-media-controls-enclosure {
        display: none !important;
      }
      video::-webkit-media-controls-panel {
        display: none !important;
      }
      video::-webkit-media-controls-play-button {
        display: none !important;
      }
      video::-webkit-media-controls-timeline {
        display: none !important;
      }
      video::-webkit-media-controls-current-time-display {
        display: none !important;
      }
      video::-webkit-media-controls-time-remaining-display {
        display: none !important;
      }
      video::-webkit-media-controls-mute-button {
        display: none !important;
      }
      video::-webkit-media-controls-volume-slider {
        display: none !important;
      }
      video::-webkit-media-controls-fullscreen-button {
        display: none !important;
      }
      
      /* Firefox */
      video::-moz-media-controls {
        display: none !important;
      }
      video::-moz-media-controls-enclosure {
        display: none !important;
      }
  
      /* 添加自定义进度条样式 */
      .custom-progress {
        position: absolute;
        bottom: 60px;
        left: 0;
        right: 0;
        height: 4px;
        background: rgba(255, 255, 255, 0.2);
        cursor: pointer;
        transition: height 0.2s ease;
      }
  
      .custom-progress:hover {
        height: 6px;
      }
  
      .progress-bar {
        height: 100%;
        background: rgb(168, 85, 247);
        transition: width 0.1s linear;
      }
  
      .progress-hover {
        position: absolute;
        top: -30px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        transform: translateX(-50%);
        display: none;
      }
  
      .custom-progress:hover .progress-hover {
        display: block;
      }
    `}</style>
  );

// 加载指示器组件
const LoadingIndicator = () => (
  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
    <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
  </div>
);

// 标题和描述组件
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

// 音量控制组件
const VolumeControl = ({ volume, isMuted, onVolumeChange, onMuteToggle }) => (
  <div className="flex items-center gap-4">
    <button
      onClick={(e) => {
        e.stopPropagation();
        onMuteToggle();
      }}
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
      step="0.01"
      value={isMuted ? 0 : volume}
      onChange={(e) => {
        e.stopPropagation();
        onVolumeChange(e);
      }}
      onClick={(e) => e.stopPropagation()}
      className="volume-slider h-1 w-24"
    />
  </div>
);

VolumeControl.propTypes = {
  volume: PropTypes.number.isRequired,
  isMuted: PropTypes.bool.isRequired,
  onVolumeChange: PropTypes.func.isRequired,
  onMuteToggle: PropTypes.func.isRequired
};

// 控制按钮组件
const ControlButtons = ({ isFullscreen, onFullscreen, onClose }) => (
  <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onFullscreen();
      }}
      className="rounded-full bg-white/20 p-2 transition-colors hover:bg-white/30"
    >
      {isFullscreen ? (
        <Minimize2 className="h-5 w-5 text-white" />
      ) : (
        <Maximize2 className="h-5 w-5 text-white" />
      )}
    </button>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      className="rounded-full bg-white/20 p-2 transition-colors hover:bg-white/30"
    >
      <X className="h-5 w-5 text-white" />
    </button>
  </div>
);

ControlButtons.propTypes = {
  isFullscreen: PropTypes.bool.isRequired,
  onFullscreen: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

// 视频控制栏组件
const Controls = ({ volume, isMuted, isFullscreen, onVolumeChange, onMuteToggle, onFullscreen, onClose }) => (
  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/80 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
    <VolumeStyles />
    <VolumeControl
      volume={volume}
      isMuted={isMuted}
      onVolumeChange={onVolumeChange}
      onMuteToggle={onMuteToggle}
    />
    <ControlButtons
      isFullscreen={isFullscreen}
      onFullscreen={onFullscreen}
      onClose={onClose}
    />
  </div>
);

Controls.propTypes = {
  volume: PropTypes.number.isRequired,
  isMuted: PropTypes.bool.isRequired,
  isFullscreen: PropTypes.bool.isRequired,
  onVolumeChange: PropTypes.func.isRequired,
  onMuteToggle: PropTypes.func.isRequired,
  onFullscreen: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

// 视频内容组件
const VideoContent = ({ videoUrl, videoRef, volume, isMuted, onLoadEnd }) => {
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
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
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
          ref={videoRef}
          className="h-full w-full"
          controls
          autoPlay
          volume={volume}
          muted={isMuted}
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
  videoRef: PropTypes.object,
  volume: PropTypes.number.isRequired,
  isMuted: PropTypes.bool.isRequired,
  onLoadEnd: PropTypes.func.isRequired
};

// 主视频播放器组件
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
        <div className="group relative h-full w-full" onClick={e => e.stopPropagation()}>
          {isLoading && <LoadingIndicator />}
          
          <VideoContent
            videoUrl={videoUrl}
            videoRef={videoRef}
            volume={volume}
            isMuted={isMuted}
            onLoadEnd={() => setIsLoading(false)}
          />

          <Controls
            volume={volume}
            isMuted={isMuted}
            isFullscreen={isFullscreen}
            onVolumeChange={handleVolumeChange}
            onMuteToggle={handleMuteToggle}
            onFullscreen={toggleFullscreen}
            onClose={onClose}
          />
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