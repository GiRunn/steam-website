// src/pages/home/components/VideoSection/index.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoPlayer } from './VideoPlayer';

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
          {video.description && (
            <p className="mt-2 text-sm text-gray-400">{video.description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

VideoCard.propTypes = {
  video: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    thumbnail: PropTypes.string.isRequired,
    videoUrl: PropTypes.string.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
  onPlay: PropTypes.func.isRequired,
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
      <AnimatePresence>
        {currentVideo && (
          <VideoPlayer
            videoUrl={currentVideo.videoUrl}
            title={currentVideo.title}
            description={currentVideo.description}
            onClose={() => setCurrentVideo(null)}
          />
        )}
      </AnimatePresence>

      <section className="relative overflow-hidden py-12">
       