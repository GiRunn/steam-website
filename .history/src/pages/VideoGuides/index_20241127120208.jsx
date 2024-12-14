// E:\Steam\steam-website\src\pages\VideoGuides\index.jsx
// 用途：视频指南主页面，整合所有子组件并管理状态

// E:\Steam\steam-website\src\pages\VideoGuides\index.jsx
// 用途：视频指南主页面，整合所有子组件并管理状态

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { VIDEO_GUIDES, VIEW_MODES } from './constants';
// 修正导入路径
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
// 修正语言包导入
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
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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

  // 获取当前语言包
  const t = locale === 'zh' ? zhLocale : enLocale;

  // 处理视频过滤和排序
  useEffect(() => {
    let results = VIDEO_GUIDES.filter(video => {
      const matchesCategory = currentCategory === 'all' || video.category === currentCategory;
      const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase());
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

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 处理视频播放
  const handlePlayVideo = (videoId) => {
    setPlayingVideo(videoId === playingVideo ? null : videoId);
  };

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
            <NoResults />
          )}
        </Suspense>

        {/* 页脚 */}
        <div className={darkMode ? 'dark' : ''}>
          <Footer
            darkMode={darkMode}
            t={t}
            showVideo={showVideo}
            setShowVideo={setShowVideo}
            showScrollTop={showScrollTop}
          />
        </div>
      </main>
    </div>
  );
};

export default VideoGuides;