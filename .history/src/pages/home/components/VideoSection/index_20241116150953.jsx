// E:\Steam\steam-website\src\pages\home\components\VideoSection\index.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 视频播放模态框组件
const VideoModal = ({ video, onClose }) => {
  // 防止视频播放时页面滚动
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
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
        <button
          onClick={onClose}
          className="absolute -right-2 -top-2 z-10 rounded-full bg-white p-2 text-gray-800 shadow-lg transition-transform hover:scale-110"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl">
          <video
            autoPlay
            controls
            className="h-full w-full"
            src={video.videoUrl}
          >
            <source src={video.videoUrl} type="video/mp4" />
            您的浏览器不支持视频播放。
          </video>
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

const VideoSection = ({ videoList, setShowVideo }) => {
  const [displayCount, setDisplayCount] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredVideo, setHoveredVideo] = useState(null);
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

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
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
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {videoList.slice(0, displayCount).map((video, index) => (
              <motion.div
                key={video.id}
                variants={itemVariants}
                layoutId={`video-${video.id}`}
                className="group relative"
                onHoverStart={() => setHoveredVideo(video.id)}
                onHoverEnd={() => setHoveredVideo(null)}
              >
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-lg transition-all duration-500 ease-out hover:shadow-2xl">
                  {/* 缩略图容器 */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    
                    {/* 悬停遮罩 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    
                    {/* 播放按钮 */}
                    <motion.button
                      initial={false}
                      animate={{
                        scale: hoveredVideo === video.id ? 1 : 0.8,
                        opacity: hoveredVideo === video.id ? 1 : 0
                      }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setShowVideo(video)}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
                    >
                      <Play className="h-16 w-16 text-white drop-shadow-lg" />
                      <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-white/30" />
                    </motion.button>

                    {/* 悬浮特效 */}
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

                  {/* 装饰线条 */}
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
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
              className={`group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-400 to-purple-400 px-8 py-3 text-white shadow-lg transition-all duration-300 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50`}
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
  ).isRequired,
  setShowVideo: PropTypes.func.isRequired
};

export default VideoSection;