import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LoadingScreen from '../../components/LoadingScreen';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Toast } from '../../components/ui/Toast';
// 导入所有子组件
import VideoHeader from './components/VideoHeader';
import VideoSearch from './components/VideoSearch';
import VideoCategories from './components/VideoCategories';
import VideoGrid from './components/VideoGrid';
import NoResults from './components/NoResults';

// 导入常量
import { VIDEO_CATEGORIES, VIDEO_GUIDES } from './constants';

const VideoGuides = ({ darkMode, toggleDarkMode, locale, toggleLocale }) => {
  // 状态管理
  const [isLoading, setIsLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [playingVideo, setPlayingVideo] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  // 视频过滤
  const filteredVideos = VIDEO_GUIDES.filter(video => {
    const matchesCategory = currentCategory === 'all' || video.category === currentCategory;
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#0a0f16] text-white">
      <Navbar
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        locale={locale}
        toggleLocale={toggleLocale}
      />

      <main className="container mx-auto px-4 py-8">
        <VideoHeader />

        <VideoSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          viewMode={viewMode}
          setViewMode={setViewMode}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        <VideoCategories
          categories={VIDEO_CATEGORIES}
          currentCategory={currentCategory}
          setCurrentCategory={setCurrentCategory}
        />

        {filteredVideos.length > 0 ? (
          <VideoGrid
            videos={filteredVideos}
            viewMode={viewMode}
            playingVideo={playingVideo}
            setPlayingVideo={setPlayingVideo}
          />
        ) : (
          <NoResults />
        )}
      </main>

      <Footer
        darkMode={darkMode}
        locale={locale}
      />

      <Toast />
    </div>
  );
};

export default VideoGuides;