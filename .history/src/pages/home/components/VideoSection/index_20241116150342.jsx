// E:\Steam\steam-website\src\pages\home\components\VideoSection\index.jsx

import React, { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

// 内部视频卡片组件
const VideoCard = ({ video, onClick, index }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative"
    >
      <Card className="overflow-hidden border-0 bg-card/50 transition-all duration-300 hover:shadow-xl">
        <CardContent className="p-0">
          <div className="relative aspect-video overflow-hidden">
            {!isLoaded && !isError && (
              <Skeleton className="absolute inset-0" />
            )}
            <img
              src={video.thumbnail}
              alt={video.title}
              className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setIsLoaded(true)}
              onError={() => setIsError(true)}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <button
              onClick={onClick}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110"
            >
              <Play className="h-16 w-16 text-white drop-shadow-lg" />
            </button>
          </div>
          <div className="p-4">
            <h3 className="line-clamp-2 text-lg font-medium text-card-foreground group-hover:text-primary">
              {video.title}
            </h3>
            {video.description && (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {video.description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// 区域标题组件
const SectionHeader = ({ title }) => (
  <div className="mb-8 flex items-center justify-between">
    <h2 className="bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
      {title}
    </h2>
    <Link
      to="/videos"
      className="group flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
    >
      查看全部
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  </div>
);

// 主组件
const VideoSection = ({ videoList, setShowVideo }) => {
  const [displayCount, setDisplayCount] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const loaderRef = useRef(null);

  // 无限滚动加载实现
  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && displayCount < videoList.length && !isLoading) {
        setIsLoading(true);
        setTimeout(() => {
          setDisplayCount((prev) => Math.min(prev + 4, videoList.length));
          setIsLoading(false);
        }, 500); // 模拟加载延迟
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
    <section className="video-section py-12">
      <div className="container mx-auto px-4">
        <SectionHeader title="精彩视频" />
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {videoList.slice(0, displayCount).map((video, index) => (
              <VideoCard
                key={video.id}
                video={video}
                index={index}
                onClick={() => setShowVideo(video)}
              />
            ))}
          </AnimatePresence>
        </div>

        {displayCount < videoList.length && (
          <div
            ref={loaderRef}
            className="mt-8 flex justify-center"
          >
            {isLoading ? (
              <Button disabled variant="outline" size="lg">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                加载中...
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setDisplayCount(prev => Math.min(prev + 4, videoList.length))}
              >
                加载更多
              </Button>
            )}
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