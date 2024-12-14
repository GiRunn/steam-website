// src/pages/Community/index.jsx

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingScreen from '../../components/LoadingScreen';
import CreatePostModal from './components/CreatePost/index';
import SearchSection from './components/SearchSection';
import CommunityHeader from './components/CommunityHeader';  



import PostList from './PostDetail/components/PostList';
import CommunityStats from './components/Sidebar/CommunityStats';
import TrendingTopics from './components/Sidebar/TrendingTopics';
import { MOCK_POSTS } from './constants';

const Community = ({ darkMode, toggleDarkMode, locale, toggleLocale }) => {
  // 状态管理
  const [isLoading, setIsLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState([]);

  // 初始化数据
  useEffect(() => {
    const initData = async () => {
      try {
        // 模拟加载数据
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPosts(MOCK_POSTS);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#0a0f16]">
      <Navbar 
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        locale={locale}
        toggleLocale={toggleLocale}
      />

      <main className="container mx-auto px-4 py-6">
        {/* 社区头部 */}
        <CommunityHeader onCreatePost={() => setShowCreatePost(true)} />

        {/* 搜索和分类 */}
        <SearchSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          currentCategory={currentCategory}
          setCurrentCategory={setCurrentCategory}
        />

        {/* 主要内容区 */}
        <div className="flex gap-8">
          {/* 帖子列表 */}
          <PostList
            posts={posts}
            isLoading={isLoading}
          />

          {/* 侧边栏 */}
          <div className="w-80 flex-shrink-0 space-y-6">
            <CommunityStats />
            <TrendingTopics />
          </div>
        </div>
      </main>

      {/* 发帖弹窗 */}
      <AnimatePresence>
        {showCreatePost && (
          <CreatePostModal
            isOpen={showCreatePost}
            onClose={() => setShowCreatePost(false)}
          />
        )}
      </AnimatePresence>

      <Footer
        darkMode={darkMode}
        showVideo={false}
        setShowVideo={() => {}}
        showScrollTop={false}
        t={locale === 'zh' ? require('../../locales/zh').default : require('../../locales/en').default}
      />


      
    </div>
  );
};

export default Community;