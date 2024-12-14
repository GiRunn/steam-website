import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingScreen from '../../components/LoadingScreen';
import CreatePostModal from './components/CreatePost/index';
import SearchSection from './components/SearchSection';
import CommunityHeader from './components/CommunityHeader';
import PostList from './components/PostList';
import CommunityStats from './components/Sidebar/CommunityStats';
import TrendingTopics from './components/Sidebar/TrendingTopics';
import { MOCK_POSTS } from './constants';

// 新增装饰性背景组件
const DecorativeBg = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* 顶部光晕效果 */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] 
                    bg-blue-500/10 blur-[120px] rounded-full opacity-20" />
    {/* 右侧装饰线条 */}
    <div className="absolute top-20 right-0 w-[1px] h-[80%] bg-gradient-to-b 
                    from-transparent via-gray-700/20 to-transparent" />
    {/* 左侧装饰线条 */}
    <div className="absolute top-20 left-0 w-[1px] h-[80%] bg-gradient-to-b 
                    from-transparent via-gray-700/20 to-transparent" />
    {/* 网格背景 */}
    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
  </div>
);

// 新增分类标签组件
const CategoryTag = ({ label, isActive, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                ${isActive 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                  : 'bg-gray-800/40 text-gray-400 border border-gray-700/30 hover:bg-gray-800/60'}`}
  >
    {label}
  </motion.button>
);

const Community = ({ darkMode, toggleDarkMode, locale, toggleLocale }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const initData = async () => {
      try {
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

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#0a0f16] relative">
      {/* 装饰性背景 */}
      <DecorativeBg />
      
      <Navbar 
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        locale={locale}
        toggleLocale={toggleLocale}
      />

      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-6 relative"
      >
        {/* 社区头部 - 添加玻璃拟态效果 */}
        <div className="backdrop-blur-sm bg-gray-900/40 rounded-xl p-6 mb-8 border border-gray-800/50">
          <CommunityHeader onCreatePost={() => setShowCreatePost(true)} />
        </div>

        {/* 搜索和分类区域 - 增加视觉层次 */}
        <div className="bg-gray-900/40 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-800/50">
          <SearchSection
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            currentCategory={currentCategory}
            setCurrentCategory={setCurrentCategory}
          />
          
          {/* 分类标签横向滚动区 */}
          <div className="mt-6 flex gap-3 overflow-x-auto pb-2 scrollbar-hidden">
            <CategoryTag 
              label="全部" 
              isActive={currentCategory === 'all'}
              onClick={() => setCurrentCategory('all')}
            />
            <CategoryTag 
              label="公告" 
              isActive={currentCategory === 'announcement'}
              onClick={() => setCurrentCategory('announcement')}
            />
            <CategoryTag 
              label="讨论" 
              isActive={currentCategory === 'discussion'}
              onClick={() => setCurrentCategory('discussion')}
            />
            <CategoryTag 
              label="问答" 
              isActive={currentCategory === 'qa'}
              onClick={() => setCurrentCategory('qa')}
            />
            <CategoryTag 
              label="建议" 
              isActive={currentCategory === 'suggestion'}
              onClick={() => setCurrentCategory('suggestion')}
            />
          </div>
        </div>

        {/* 主要内容区 - 优化布局和间距 */}
        <div className="flex gap-8">
          {/* 帖子列表 */}
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <PostList
              posts={posts}
              isLoading={isLoading}
            />
          </motion.div>

          {/* 侧边栏 - 添加视觉吸引力 */}
          <motion.div 
            className="w-80 flex-shrink-0 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="bg-gray-900/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
              <CommunityStats />
            </div>
            <div className="bg-gray-900/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
              <TrendingTopics />
            </div>
          </motion.div>
        </div>
      </motion.main>

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

      {/* 右下角快速发帖按钮 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowCreatePost(true)}
        className="fixed right-8 bottom-8 bg-blue-500 hover:bg-blue-600 
                   text-white rounded-full p-4 shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </motion.button>
    </div>
  );
};

export default Community;