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