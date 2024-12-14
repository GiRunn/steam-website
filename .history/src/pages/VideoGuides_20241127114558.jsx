// VideoGuides.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import enLocale from '../locales/en';//页脚
import zhLocale from '../locales/zh';//页脚
import Footer from '../components/Footer';//页脚
import en from '../locales/en';//页脚
import zh from '../locales/zh';//页脚

import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  ChevronRight,
  Star,
  Clock,
  Eye,
  ThumbsUp,
  Share,
  Bookmark,
  Search,
  Filter,
  Grid,
  List,
  SortAsc,
  Shield,  // 添加这行
  Download,// 添加这行
  BookOpen
} from 'lucide-react';

// 视频分类数据
const VIDEO_CATEGORIES = [
  { 
    id: 'getting-started',
    name: '新手入门',
    icon: BookOpen,
    color: 'blue',
    description: '适合刚接触游戏商城的用户'
  },
  { 
    id: 'purchase',
    name: '购买指南',
    icon: Star,
    color: 'yellow',
    description: '如何购买、支付和管理订单'
  },
  { 
    id: 'account',
    name: '账户安全',
    icon: Shield,
    color: 'green',
    description: '账户设置和安全建议'
  },
  {
    id: 'download',
    name: '下载安装',
    icon: Download,
    color: 'purple',
    description: '游戏下载和安装指南'
  }
];

// 视频数据
const VIDEO_GUIDES = [
  {
    id: 1,
    title: '如何购买游戏',
    description: '详细介绍在游戏商城购买游戏的完整流程...',
    thumbnail: '/api/placeholder/640/360',
    duration: '5:32',
    category: 'purchase',
    views: 12500,
    likes: 890,
    featured: true,
    tags: ['购买', '支付', '新手指南'],
    date: '2024-01-15'
  },
  // ... 更多视频数据
];

const VideoGuides = ({ darkMode, toggleDarkMode, locale, toggleLocale }) => {
  // 状态管理
  const [currentCategory, setCurrentCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [playingVideo, setPlayingVideo] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false); //页脚
  const [showVideo, setShowVideo] = useState(false); //页脚
  //页脚
  const translations = {
    en: en,
    zh: zh,
  };
    // 获取当前语言包/页脚
  const t = locale === 'zh' ? zhLocale : enLocale;

  // 视频过滤
  const filteredVideos = VIDEO_GUIDES.filter(video => {
    const matchesCategory = currentCategory === 'all' || video.category === currentCategory;
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#1b2838] text-white">
      <Navbar
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        locale={locale}
        toggleLocale={toggleLocale}
      />

      <main className="container mx-auto px-4 py-8">
        {/* 头部横幅 */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-black opacity-20" />
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="relative">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold mb-4"
            >
              使用指导视频
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-white/80 max-w-2xl"
            >
              通过专业视频教程，轻松了解游戏商城的各项功能和使用技巧
            </motion.p>
          </div>
        </div>

        {/* 搜索和筛选区 */}
        <div className="flex flex-wrap gap-6 mb-8">
          {/* 搜索框 */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索视频..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-[#253447] border border-white/10 rounded-xl 
                  text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* 视图切换 */}
          <div className="flex items-center gap-2 bg-[#253447] rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          {/* 排序 */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-12 pl-4 pr-10 bg-[#253447] border border-white/10 rounded-xl
                text-white appearance-none focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="newest">最新发布</option>
              <option value="popular">最受欢迎</option>
              <option value="views">观看最多</option>
            </select>
            <SortAsc className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* 分类标签 */}
        <div className="flex items-center gap-4 overflow-x-auto pb-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentCategory('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              currentCategory === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-white/5 hover:bg-white/10 text-gray-400'
            }`}
          >
            <span>全部</span>
          </motion.button>

          {VIDEO_CATEGORIES.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                currentCategory === category.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-white/5 hover:bg-white/10 text-gray-400'
              }`}
            >
              <category.icon className="w-5 h-5" />
              <span>{category.name}</span>
            </motion.button>
          ))}
        </div>


        <div className={`grid ${
        viewMode === 'grid' 
            ? 'grid-cols-1 lg:grid-cols-2 gap-8' // 改为两列以适应更大的卡片
            : 'grid-cols-1 gap-6'
        }`}>
        {filteredVideos.map((video) => (
            <VideoCard 
            key={video.id}
            video={video}
            viewMode={viewMode}
            onPlay={() => setPlayingVideo(video.id)}
            isPlaying={playingVideo === video.id}
            />
        ))}
        </div>

        {/* 无结果提示 */}
        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">未找到相关视频</h3>
              <p className="text-gray-400">
                试试其他关键词或浏览不同分类
              </p>
            </motion.div>
          </div>
        )}
        {/* 页脚 */}
        <div className={darkMode ? 'dark' : ''}>
          <Footer
            darkMode={darkMode}
            t={locale === 'zh' ? zhLocale : enLocale}  // 确保正确传递翻译对象
            showVideo={showVideo}
            setShowVideo={setShowVideo}
            showScrollTop={showScrollTop}
          />
        </div>
      </main>
    </div>
  );
};

// 视频卡片组件
// 在 VideoCard 组件中修改尺寸和布局
const VideoCard = ({ video, viewMode, onPlay, isPlaying }) => {
  const [isHovered, setIsHovered] = useState(false);
  

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: viewMode === 'grid' ? 1.02 : 1 }}
      className={`bg-[#1e2837] rounded-xl overflow-hidden ${
        viewMode === 'list' ? 'flex gap-6' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 缩略图 - 修改尺寸 */}
      <div className={`relative ${
        viewMode === 'list' 
          ? 'w-[480px] flex-shrink-0' // 列表视图更宽
          : 'w-full' // 网格视图全宽
      }`}>
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full aspect-video object-cover" // 保持16:9比例
          style={{ minHeight: viewMode === 'grid' ? '240px' : '270px' }} // 设置最小高度
        />
        
        {/* 播放按钮 - 增大尺寸 */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onPlay}
          className="absolute inset-0 flex items-center justify-center bg-black/50 group"
        >
          {isPlaying ? (
            <Pause className="w-16 h-16 text-white group-hover:text-blue-400 transition-colors" />
          ) : (
            <Play className="w-16 h-16 text-white group-hover:text-blue-400 transition-colors" />
          )}
        </motion.button>

        {/* 时长标签 - 调整位置和大小 */}
        <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/80 rounded-md text-sm font-medium">
          {video.duration}
        </div>
      </div>

      {/* 视频信息 - 调整内边距 */}
      <div className="p-6">
        <h3 className="text-xl font-medium text-white hover:text-blue-400 transition-colors">
          {video.title}
        </h3>
        <p className="mt-3 text-gray-400 text-base line-clamp-2">
          {video.description}
        </p>
        
        {/* 标签 */}
        <div className="mt-4 flex flex-wrap gap-2">
          {video.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 bg-white/5 rounded-full text-sm text-gray-400"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 统计信息 */}
        <div className="mt-5 flex items-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            <span>{video.views.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <ThumbsUp className="w-5 h-5" />
            <span>{video.likes.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span>{new Date(video.date).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoGuides;