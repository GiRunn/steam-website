// E:\Steam\steam-website\src\pages\VideoGuides\index.jsx
// 用途：视频指南主页面，整合所有子组件并管理状态

import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { VIDEO_GUIDES, VIEW_MODES } from './constants';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import enLocale from '../../locales/en';
import zhLocale from '../../locales/zh';

// 懒加载子组件
const VideoHeader = lazy(() => import('./components/VideoHeader'));
const VideoSearch = lazy(() => import('./components/VideoSearch'));
const VideoCategories = lazy(() => import('./components/VideoCategories'));
const VideoGrid = lazy(() => import('./components/VideoGrid'));
const NoResults = lazy(() => import('./components/NoResults'));

// 加载占位组件
const LoadingFallback = () => (
  <div className="w-full h-32 flex items-center justify-center">
    <div className="relative">
      {/* 加载动画背景光效 */}
      <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl scale-150" />
      <div className="relative w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  </div>
);

const VideoGuides = ({ darkMode, toggleDarkMode, locale, toggleLocale }) => {
  // 状态管理
  const [currentCategory, setCurrentCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [sortBy, setSortBy] = useState('newest');
  const [playingVideo, setPlayingVideo] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [filteredVideos, setFilteredVideos] = useState(VIDEO_GUIDES);
  const [isSearching, setIsSearching] = useState(false);

  // 获取当前语言包
  const t = locale === 'zh' ? zhLocale : enLocale;

  // 清空所有筛选条件
  const handleResetFilters = useCallback(() => {
    setCurrentCategory('all');
    setSearchTerm('');
    setSortBy('newest');
    setIsSearching(false);
    setPlayingVideo(null);
    // 重置为默认数据
    setFilteredVideos(VIDEO_GUIDES.sort((a, b) => new Date(b.date) - new Date(a.date)));
  }, []);

  // 处理视频过滤和排序 - 使用 useCallback 优化性能
  const filterAndSortVideos = useCallback(() => {
    setIsSearching(true);
    let results = VIDEO_GUIDES.filter(video => {
      const matchesCategory = currentCategory === 'all' || video.category === currentCategory;
      const matchesSearch = searchTerm ? (
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      ) : true;
      return matchesCategory && matchesSearch;
    });

    // 排序处理
    results = results.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date) - new Date(a.date);
        case 'popular':
          return b.likes - a.likes;
        case 'views':
          return b.views - a.views;
        default:
          return 0;
      }
    });

    setFilteredVideos(results);
  }, [currentCategory, searchTerm, sortBy]);

  // 监听筛选条件变化
  useEffect(() => {
    filterAndSortVideos();
  }, [filterAndSortVideos]);

  // 监听滚动事件 - 使用 useCallback 优化性能
  useEffect(() => {
    const handleScroll = useCallback(() => {
      setShowScrollTop(window.scrollY > 300);
    }, []);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 处理视频播放
  const handlePlayVideo = useCallback((videoId) => {
    setPlayingVideo(videoId === playingVideo ? null : videoId);
  }, [playingVideo]);

  return (
    <div className="min-h-screen bg-[#1b2838] text-white">
      <Navbar
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        locale={locale}
        toggleLocale={toggleLocale}
      />

      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingFallback />}>
          {/* 头部横幅 */}
          <VideoHeader />

          {/* 搜索和筛选区 */}
          <VideoSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            viewMode={viewMode}
            setViewMode={setViewMode}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          {/* 分类标签 */}
          <VideoCategories
            currentCategory={currentCategory}
            setCurrentCategory={setCurrentCategory}
          />

          {/* 视频列表或无结果提示 */}
          {filteredVideos.length > 0 ? (
            <VideoGrid
              videos={filteredVideos}
              viewMode={viewMode}
              playingVideo={playingVideo}
              onPlayVideo={handlePlayVideo}
            />
          ) : (
            <NoResults 
              onReset={handleResetFilters}
            />
          )}
        </Suspense>
      </main>
      <div className={darkMode ? 'dark' : ''}>
        <Footer
          darkMode={darkMode}
          t={t}
          showVideo={showVideo}
          setShowVideo={setShowVideo}
          showScrollTop={showScrollTop}
        />
      </div>
    </div>
  );
};

export default VideoGuides;