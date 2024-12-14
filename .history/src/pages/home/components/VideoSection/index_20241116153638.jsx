// E:\Steam\steam-website\src\pages\home\components\VideoSection\index.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Loader2, X, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


// 视频播放器组件 - 支持多种视频源
const VideoPlayer = ({ videoUrl, onClose }) => {
  const videoRef = useRef(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // 判断视频类型
  const getVideoType = (url) => {
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    // Bilibili
    if (url.includes('bilibili.com')) {
      return 'bilibili';
    }
    // 直接视频文件链接
    return 'direct';
  };

  // 获取 YouTube 视频 ID
  const getYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // 获取 Bilibili 视频 ID
  const getBilibiliId = (url) => {
    const regExp = /^.*(?:bilibili.com\/video\/(BV[\w]+)|aid=(\d+))/;
    const match = url.match(regExp);
    return match ? match[1] || match[2] : null;
  };

  const renderVideoPlayer = () => {
    const videoType = getVideoType(videoUrl);

    switch (videoType) {
      case 'youtube':
        const youtubeId = getYoutubeId(videoUrl);
        return (
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      case 'bilibili':
        const bilibiliId = getBilibiliId(videoUrl);
        return (
          <iframe
            className="h-full w-full"
            src={`//player.bilibili.com/player.html?bvid=${bilibiliId}&autoplay=1`}
            scrolling="no"
            border="0"
            frameBorder="no"
            framespacing="0"
            allowFullScreen
          />
        );
      case 'direct':
      default:
        return (
          <video
            ref={videoRef}
            className="h-full w-full"
            controls
            autoPlay
            volume={volume}
            muted={isMuted}
          >
            <source src={videoUrl} type="video/mp4" />
            您的浏览器不支持视频播放。
          </video>
        );
    }
  };





// 视频播放器控制组件
const VideoControls = ({ video, volume, isMuted, onVolumeChange, onMuteToggle, onClose }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/80 p-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onMuteToggle}
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
          value={volume}
          onChange={onVolumeChange}
          className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-white/20"
        />
      </div>
      <button
        onClick={onClose}
        className="rounded-full bg-white/20 p-2 transition-colors hover:bg-white/30"
      >
        <X className="h-5 w-5 text-white" />
      </button>
    </div>
  );
};

// 视频播放模态框组件
const VideoModal = ({ video, onClose }) => {
  const videoRef = useRef(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // 防止视频播放时页面滚动
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // 音量控制
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    // 如果音量大于0，取消静音
    if (newVolume > 0) {
      setIsMuted(false);
      if (videoRef.current) {
        videoRef.current.muted = false;
      }
    }
  };

  // 静音控制
  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-6xl px-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl">
          <video
            ref={videoRef}
            autoPlay
            controls
            className="h-full w-full"
            volume={volume}
            muted={isMuted}
          >
            <source src={video.videoUrl} type="video/mp4" />
            您的浏览器不支持视频播放。
          </video>
          <VideoControls
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={handleVolumeChange}
            onMuteToggle={handleMuteToggle}
            onClose={onClose}
          />
        </div>

        <div className="mt-4 rounded-lg bg-white/10 p-4 backdrop-blur-lg">
          <h3 className="text-xl font-bold text-white">{video.title}</h3>
          {video.description && (
            <p className="mt-2 text-gray-200">{video.description}</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// 视频卡片组件
const VideoCard = ({ video, index, onPlay }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.5,
            delay: index * 0.1
          }
        }
      }}
      className="group"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-lg transition-all duration-500 ease-out hover:shadow-2xl">
        <div className="relative aspect-video overflow-hidden">
          {!isLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gray-800">
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            </div>
          )}
          <img
            src={video.thumbnail}
            alt={video.title}
            className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setIsLoaded(true)}
          />
          
          {/* 悬停遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          
          {/* 播放按钮 */}
          <motion.button
            initial={false}
            animate={{
              scale: isHovered ? 1 : 0.8,
              opacity: isHovered ? 1 : 0
            }}
            transition={{ duration: 0.2 }}
            onClick={() => onPlay(video)}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform cursor-pointer"
          >
            <div className="relative">
              <Play className="h-16 w-16 text-white drop-shadow-lg" />
              <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-white/30" />
            </div>
          </motion.button>

          {/* 视觉效果装饰 */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        {/* 视频信息 */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white transition-colors duration-300 group-hover:text-blue-400">
            {video.title}
          </h3>
          {video.description && (
            <p className="mt-2 line-clamp-2 text-sm text-gray-400">
              {video.description}
            </p>
          )}
        </div>

        {/* 底部装饰线条 */}
        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
    </motion.div>
  );
};

// 主组件
const VideoSection = ({ videoList }) => {
  const [displayCount, setDisplayCount] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const loaderRef = useRef(null);

  // 无限滚动实现
  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && displayCount < videoList.length && !isLoading) {
        setIsLoading(true);
        setTimeout(() => {
          setDisplayCount((prev) => Math.min(prev + 4, videoList.length));
          setIsLoading(false);
        }, 500);
      }
    },
    [displayCount, videoList.length, isLoading]
  );

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 0
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [handleObserver]);

  return (
    <>
      <AnimatePresence>
        {currentVideo && (
          <VideoModal 
            video={currentVideo} 
            onClose={() => setCurrentVideo(null)} 
          />
        )}
      </AnimatePresence>

      <section className="video-section relative overflow-hidden py-12">
        {/* 背景装饰 */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-blue-400/10 blur-3xl" />
          <div className="absolute -right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-purple-400/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4">
          {/* 标题区域 */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex items-center justify-between"
          >
            <h2 className="relative text-4xl font-bold">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                精彩视频
              </span>
              <div className="absolute -bottom-2 left-0 h-1 w-1/3 bg-gradient-to-r from-blue-400 to-purple-400" />
            </h2>
            
            <Link 
              to="/videos" 
              className="group flex items-center gap-2 text-gray-600 transition-colors hover:text-blue-400"
            >
              查看全部
              <ArrowRight className="transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {/* 视频网格 */}
          <motion.div 
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {videoList.slice(0, displayCount).map((video, index) => (
              <VideoCard
                key={video.id}
                video={video}
                index={index}
                onPlay={setCurrentVideo}
              />
            ))}
          </motion.div>

          {/* 加载更多按钮 */}
          {displayCount < videoList.length && (
            <div
              ref={loaderRef}
              className="mt-8 flex justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
                className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-400 to-purple-400 px-8 py-3 text-white shadow-lg transition-all duration-300 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => {
                  if (!isLoading) {
                    setIsLoading(true);
                    setTimeout(() => {
                      setDisplayCount(prev => Math.min(prev + 4, videoList.length));
                      setIsLoading(false);
                    }, 500);
                  }
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      加载中...
                    </>
                  ) : (
                    '加载更多'
                  )}
                </span>
                <div className="absolute inset-0 -z-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </motion.button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

VideoSection.propTypes = {
  videoList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      thumbnail: PropTypes.string.isRequired,
      description: PropTypes.string,
      videoUrl: PropTypes.string.isRequired
    })
  ).isRequired
};

export default VideoSection;