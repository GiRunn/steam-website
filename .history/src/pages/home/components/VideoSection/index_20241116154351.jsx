// E:\Steam\steam-website\src\pages\home\components\VideoSection\index.jsx

import React, { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Loader2, X, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


// 视频控制组件
const VideoControls = ({ volume, isMuted, onVolumeChange, onMuteToggle, onClose }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/80 p-4 opacity-0 transition-opacity duration-300 hover:opacity-100">
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

// 视频播放器组件
const VideoPlayer = ({ videoUrl, onClose }) => {
  const videoRef = useRef(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      if (newVolume > 0) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  const getVideoType = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    if (url.includes('bilibili.com')) {
      return 'bilibili';
    }
    return 'direct';
  };

  const getYoutubeId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const getBilibiliId = (url) => {
    const regExp = /^.*(?:bilibili.com\/video\/(BV[\w]+)|aid=(\d+))/;
    const match = url.match(regExp);
    return match ? match[1] || match[2] : null;
  };

// 视频播放器组件
const VideoPlayer = ({ videoUrl, onClose }) => {
  const videoRef = useRef(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 处理音量变化
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      if (newVolume > 0) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  // 处理静音切换
  const handleMuteToggle = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  // 获取视频类型
  const getVideoType = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    if (url.includes('bilibili.com')) {
      return 'bilibili';
    }
    return 'direct';
  };

  // 获取 YouTube ID
  const getYoutubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // 获取 Bilibili ID
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

  return (
    <div className="relative aspect-video w-full bg-black">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
        </div>
      )}
      {renderVideoContent()}
      <VideoControls
        volume={volume}
        isMuted={isMuted}
        onVolumeChange={handleVolumeChange}
        onMuteToggle={handleMuteToggle}
        onClose={onClose}
      />
    </div>
  );
};

// 视频卡片组件
const VideoCard = ({ video, index, onPlay }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-lg transition-all duration-500">
        <div className="relative aspect-video">
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
            className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setIsLoaded(true)}
          />

          <div className="absolute inset-0 bg-black/20 transition-opacity duration-300 group-hover:opacity-100" />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={false}
              animate={{
                scale: isHovered ? 1 : 0.9,
                opacity: isHovered ? 1 : 0
              }}
              transition={{ duration: 0.2 }}
              className="relative flex items-center justify-center"
            >
              <button
                onClick={() => onPlay(video)}
                className="relative flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/80 backdrop-blur-sm transition-transform duration-300 hover:scale-110"
              >
                <Play className="h-8 w-8 text-white" fill="white" />
                <div className="absolute inset-0 -z-10 animate-ping rounded-full bg-purple-500/30" />
              </button>
            </motion.div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-white transition-colors duration-300 group-hover:text-purple-400">
            {video.title}
          </h3>
        </div>
      </div>
    </motion.div>
  );
};

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <p className="text-red-500">{error}</p>
        </div>
      )}
      {renderVideoPlayer()}
      {!error && !isLoading && (
        <VideoControls
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={handleVolumeChange}
          onMuteToggle={handleMuteToggle}
          onClose={onClose}
        />
      )}
    </div>
  );
};

// 视频模态框组件
const VideoModal = ({ video, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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
        <VideoPlayer videoUrl={video.videoUrl} onClose={onClose} />
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

// 修改 VideoCard 组件中的播放按钮部分
const VideoCard = ({ video, index, onPlay }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-lg transition-all duration-500">
        <div className="relative aspect-video">
          {!isLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gray-800">
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            </div>
          )}
          
          {/* 缩略图 */}
          <img
            src={video.thumbnail}
            alt={video.title}
            className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setIsLoaded(true)}
          />

          {/* 视频遮罩层 */}
          <div className="absolute inset-0 bg-black/20 transition-opacity duration-300 group-hover:opacity-100" />
          
          {/* 播放按钮 - 修改后的版本 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={false}
              animate={{
                scale: isHovered ? 1 : 0.9,
                opacity: isHovered ? 1 : 0
              }}
              transition={{ duration: 0.2 }}
              className="relative flex items-center justify-center"
            >
              <button
                onClick={() => onPlay(video)}
                className="relative flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/80 backdrop-blur-sm transition-transform duration-300 hover:scale-110"
              >
                <Play className="h-8 w-8 text-white" fill="white" />
                <div className="absolute inset-0 -z-10 animate-ping rounded-full bg-purple-500/30" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* 视频信息 */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white transition-colors duration-300 group-hover:text-purple-400">
            {video.title}
          </h3>
        </div>
      </div>
    </motion.div>
  );
};

// 视频播放器组件修改
const VideoPlayer = ({ videoUrl, onClose }) => {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 获取视频类型
  const getVideoType = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    if (url.includes('bilibili.com')) {
      return 'bilibili';
    }
    return 'direct';
  };

  // 处理 YouTube 视频 ID
  const getYoutubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // 处理 Bilibili 视频 ID
  const getBilibiliVideoId = (url) => {
    const regExp = /^.*(?:bilibili.com\/video\/(BV[\w]+)|aid=(\d+))/;
    const match = url.match(regExp);
    return match ? match[1] || match[2] : null;
  };

  useEffect(() => {
    const videoType = getVideoType(videoUrl);
    let timeoutId;

    if (videoType === 'direct') {
      timeoutId = setTimeout(() => setIsLoading(false), 1000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [videoUrl]);

  const renderVideo = () => {
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
            onLoadedData={() => setIsLoading(false)}
          >
            <source src={videoUrl} type="video/mp4" />
            您的浏览器不支持视频播放
          </video>
        );
    }
  };

  return (
    <div className="relative aspect-video w-full bg-black">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
        </div>
      )}
      {renderVideo()}
    </div>
  );
};


// 主组件
const VideoSection = ({ videoList }) => {
  const [displayCount, setDisplayCount] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const loaderRef = useRef(null);

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
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "20px",
      threshold: 0
    });
    
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [handleObserver]);

  return (
    <>
       {/* 视频播放模态框 */}
      <AnimatePresence>
        {currentVideo && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setCurrentVideo(null)}
          >
            <div 
              className="w-full max-w-6xl"
              onClick={e => e.stopPropagation()}
            >
              <VideoPlayer 
                videoUrl={currentVideo.videoUrl} 
                onClose={() => setCurrentVideo(null)} 
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      <section className="relative overflow-hidden py-12">
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
         <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
           {videoList.slice(0, displayCount).map((video, index) => (
             <VideoCard
               key={video.id}
               video={video}
               index={index}
               onPlay={setCurrentVideo}
             />
           ))}
         </div>

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