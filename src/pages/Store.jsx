
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import enLocale from '../locales/en';//页脚
import zhLocale from '../locales/zh';//页脚
import Footer from '../components/Footer';//页脚
import en from '../locales/en';//页脚
import zh from '../locales/zh';//页脚
import { Link } from 'react-router-dom';//商品详情页
import EventDetail from './EventDetail';
import { eventService } from '../services/api';


import { 
  HashIcon,
  SparklesIcon,
  TrendingUp, 
  Zap, 
  Award, 
  Tag, 
  Star, 
  Heart, 
  ChevronFirst,
  ChevronLeft,
  ChevronRight,
  ChevronLast,
  Calendar, 
  Clock, 
  Users,
  Gamepad,
  Download,
  Trophy
} from 'lucide-react';

const Store = () => {
  // 页面状态管理
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [locale, setLocale] = useState(() => localStorage.getItem('language') || 'en');
  const [sortBy, setSortBy] = useState('releaseDate');
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  // 分页相关状态
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [showScrollTop, setShowScrollTop] = useState(false); //页脚
  const [showVideo, setShowVideo] = useState(false); //页脚
  const totalItems = 256; // 总商品数
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const translations = {
    en: en,
    zh: zh,
  };
    // 获取当前语言包
  const t = locale === 'zh' ? zhLocale : enLocale;
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setEventsLoading(true);
        // 这里先使用模拟数据
        const data = [
          {
            id: 1,
            title: "春节特惠",
            description: "数千款游戏低至1折，还有新春限定道具等你来领！",
            image: "https://picsum.photos/800/400?random=1",
            date: "2024-02-10",
            time: "10:00",
            link: "/event/1"  // 添加链接
          },
          {
            id: 2,
            title: "周年庆典",
            description: "参与活动获得限定皮肤和独特奖励",
            image: "https://picsum.photos/800/400?random=2",
            date: "2024-03-15",
            time: "14:00",
            link: "/event/2"  // 添加链接
          }
        ];
        setUpcomingEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // 分页数组生成函数
  const generatePagesArray = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  // 热门标签数据
  const popularTags = [
    { name: "开放世界", count: 1234, isActive: true },
    { name: "角色扮演", count: 856, isActive: false },
    { name: "GTA5", count: 856, isActive: false },
    { name: "防护", count: 856, isActive: false },
    { name: "任务", count: 856, isActive: false },
    { name: "丝滑", count: 856, isActive: false },
  ];



  // 游戏数据
  const games = [
    {
      id: 1,
      title: "幻想冒险",
      price: 299,
      originalPrice: 399,
      discount: 25,
      image: "https://picsum.photos/400/225",
      rating: 4.8,
      tags: ['动作', 'RPG', '开放世界'],
      releaseDate: '2024-03-15',
      publisher: "Epic Games",
      playerCount: "单人/多人",
      description: "探索广阔的开放世界,体验史诗般的冒险...",
      features: ['支持4K', 'HDR', '手柄支持'],
      reviews: {
        positive: 95,
        total: 12580
      }
    },
    // 可以添加更多游戏数据
  ];

  // 推荐游戏数据
  const recommendedGames = [
    {
      id: 1,
      title: "星空",
      description: "探索浩瀚宇宙，书写你的传奇故事",
      image: "https://picsum.photos/400/225"
    },
    {
      id: 2,
      title: "赛博朋克2077",
      description: "在未来世界中书写你的传奇",
      image: "https://picsum.photos/400/225"
    },
    {
      id: 3,
      title: "艾尔登法环",
      description: "展开一段史诗般的黑暗奇幻冒险",
      image: "https://picsum.photos/400/225"
    }
  ];


  return (
    <div className="min-h-screen bg-[#1b2838]">
      {/* 导航栏 */}
      <Navbar 
        darkMode={darkMode} 
        toggleDarkMode={() => setDarkMode(!darkMode)}
        locale={locale}
        toggleLocale={() => setLocale(locale === 'en' ? 'zh' : 'en')}
      />
      {/* 即将开始的活动区域 */}
      <div className="container mx-auto px-6 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <SparklesIcon className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold bg-clip-text text-transparent 
                bg-gradient-to-r from-blue-400 to-purple-400">
                即将开始的活动
              </h2>
            </div>
            <Link
              to={`/EventDetail/${EventDetail.id}`} key={EventDetail.id}
              className="text-blue-400 hover:text-white transition-colors"
            >
              查看全部活动
            </Link>
          </div>

          {/* 活动列表 */}
          {eventsLoading ? (
            // 加载状态显示
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="bg-[#1e2837] rounded-xl overflow-hidden">
                    <div className="aspect-[2/1] bg-gray-700" />
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-gray-700 rounded w-2/3" />
                      <div className="h-4 bg-gray-700 rounded w-full" />
                      <div className="h-4 bg-gray-700 rounded w-3/4" />
                      <div className="flex gap-4">
                        <div className="h-4 bg-gray-700 rounded w-24" />
                        <div className="h-4 bg-gray-700 rounded w-24" />
                      </div>
                      <div className="h-10 bg-gray-700 rounded w-32" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : upcomingEvents.length > 0 ? (
            // 活动列表
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingEvents.map((event, index) => (
                <Link 
                  to={`/event/${event.id}`}
                  key={event.id}
                  className="group"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-[#1e2837] rounded-xl overflow-hidden shadow-lg"
                  >
                    <div className="relative aspect-[2/1] overflow-hidden">
                      {/* 活动图片 */}
                      <motion.img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover transform 
                          transition-transform duration-700 group-hover:scale-110"
                        whileHover={{ scale: 1.1 }}
                      />
                      
                      {/* 渐变遮罩 */}
                      <div className="absolute inset-0 bg-gradient-to-t 
                        from-[#1e2837] via-[#1e2837]/50 to-transparent 
                        opacity-60 group-hover:opacity-40 transition-opacity" 
                      />
                      
                      {/* 活动内容 */}
                      <div className="absolute bottom-6 left-6 right-6 z-10">
                        {/* 标题 */}
                        <motion.h4 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="text-xl font-bold text-white mb-2 
                            group-hover:text-blue-400 transition-colors"
                        >
                          {event.title}
                        </motion.h4>

                        {/* 描述 */}
                        <motion.p 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="text-gray-300 text-sm line-clamp-2"
                        >
                          {event.description}
                        </motion.p>

                        {/* 时间信息 */}
                        <div className="flex items-center gap-4 mt-4">
                          <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center gap-2 text-sm text-gray-300"
                          >
                            <Calendar className="w-4 h-4" />
                            <span>{event.date}</span>
                          </motion.div>
                          <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center gap-2 text-sm text-gray-300"
                          >
                            <Clock className="w-4 h-4" />
                            <span>{event.time}</span>
                          </motion.div>
                        </div>

                        {/* 订阅按钮 */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.preventDefault(); // 阻止链接跳转
                            e.stopPropagation();
                            // 处理订阅逻辑
                            console.log('订阅活动:', event.id);
                          }}
                          className="relative mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 
                            to-purple-500 hover:from-blue-600 hover:to-purple-600 
                            text-white rounded-lg font-medium shadow-lg 
                            shadow-blue-500/25 transform transition-all duration-300 
                            overflow-hidden"
                        >
                          <span className="relative z-10">订阅提醒</span>
                          <motion.div 
                            className="absolute inset-0 bg-gradient-to-r from-purple-500 
                              to-blue-500 rounded-lg opacity-0 group-hover:opacity-100 
                              transition-opacity"
                            initial={{ x: '100%' }}
                            whileHover={{ x: 0 }}
                            transition={{ type: 'tween' }}
                          />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            // 无数据显示
            <div className="bg-[#1e2837] rounded-xl p-8 text-center">
              <p className="text-gray-400">暂无活动</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* 游戏分类导航 */}
      <div className="bg-[#1e2837] border-y border-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-8 overflow-x-auto scrollbar-hide">
            {[
              { icon: TrendingUp, label: '热门推荐' },
              { icon: Zap, label: '新品上市' },
              { icon: Award, label: '特惠促销' },
              { icon: Tag, label: '免费游戏' }
            ].map((item, index) => (
              <motion.button
                key={index}
                className="flex items-center gap-2 px-4 py-2 rounded-lg 
                  text-gray-300 hover:text-white hover:bg-white/5
                  whitespace-nowrap transition-all"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* 主要内容区 */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* 左侧筛选栏 */}
          <div className="w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* 价格区间 */}
              <div className="bg-[#1e2837] rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">价格区间</h3>
                <div className="space-y-4">
                  {[
                    { label: '免费游戏', count: 328 },
                    { label: '￥50以下', count: 1205 },
                    { label: '￥50-200', count: 867 },
                    { label: '￥200以上', count: 432 }
                  ].map((option, index) => (
                    <label key={index} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded border-2 border-gray-500 group-hover:border-blue-500 
                          flex items-center justify-center transition-colors">
                          <motion.div
                            initial={false}
                            animate={{ scale: option.checked ? 1 : 0 }}
                            className="w-3 h-3 bg-blue-500 rounded"
                          />
                        </div>
                        <span className="text-gray-300 group-hover:text-white transition-colors">
                          {option.label}
                        </span>
                      </div>
                      <span className="text-gray-500 text-sm">{option.count}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 游戏类型 */}
              <div className="bg-[#1e2837] rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">游戏类型</h3>
                <div className="space-y-4">
                  {[
                    { label: '动作', count: 1524 },
                    { label: '冒险', count: 982 },
                    { label: 'RPG', count: 756 },
                    { label: '策略', count: 445 },
                    { label: '模拟', count: 678 },
                    { label: '体育', count: 234 }
                  ].map((genre, index) => (
                    <label key={index} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded border-2 border-gray-500 group-hover:border-blue-500 
                          flex items-center justify-center transition-colors">
                          <motion.div
                            initial={false}
                            animate={{ scale: genre.checked ? 1 : 0 }}
                            className="w-3 h-3 bg-blue-500 rounded"
                          />
                        </div>
                        <span className="text-gray-300 group-hover:text-white transition-colors">
                          {genre.label}
                        </span>
                      </div>
                      <span className="text-gray-500 text-sm">{genre.count}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 特殊标签 */}
              <div className="bg-[#1e2837] rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">特殊标签</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    '单人',
                    '多人',
                    '在线合作',
                    'VR支持',
                    '手柄支持',
                    '成就系统',
                    '云存档',
                    '模组支持'
                  ].map((tag, index) => (
                    <button
                      key={index}
                      className="px-3 py-1.5 rounded-full text-sm text-gray-300 
                        bg-[#2a475e]/50 hover:bg-[#2a475e] hover:text-white 
                        transition-all duration-300"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 游戏列表区域 */}
          <div className="flex-1">
            {/* 统计卡片 */}
            <div className="mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  icon: Users, 
                  label: '在线玩家', 
                  value: '1,234,567',
                  change: '+12.5%',
                  trend: 'up'
                },
                { 
                  icon: Gamepad, 
                  label: '游戏总数', 
                  value: '50,000+',
                  change: '+156',
                  trend: 'up'
                },
                { 
                  icon: Download, 
                  label: '今日下载', 
                  value: '89,432',
                  change: '-5.2%',
                  trend: 'down'
                },
                { 
                  icon: Trophy, 
                  label: '成就解锁', 
                  value: '12.5M',
                  change: '+8.7%',
                  trend: 'up'
                }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#1e2837] rounded-xl p-6 hover:shadow-lg hover:shadow-blue-500/10
                    transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-white/5">
                      <stat.icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-gray-400 text-sm">{stat.label}</h4>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white">{stat.value}</span>
                        <span className={`text-sm ${
                          stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 排序和筛选 */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold bg-clip-text text-transparent 
                bg-gradient-to-r from-blue-400 to-purple-400">
                全部游戏
              </h2>
              <select 
                className="bg-[#1e2837] text-white px-4 py-2 rounded-lg border border-white/10
                  focus:outline-none focus:border-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="releaseDate">最新发布</option>
                <option value="priceAsc">价格从低到高</option>
                <option value="priceDesc">价格从高到低</option>
                <option value="rating">用户评分</option>
                <option value="popularity">热门程度</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {games.map((game, index) => (
                <Link to={`/game/${game.id}`} key={game.id} className="block">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-[#1e2837] rounded-xl overflow-hidden hover:shadow-xl 
                      hover:shadow-blue-500/10 transition-all duration-500"
                  >
                    {/* 游戏封面 */}
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={game.image}
                        alt={game.title}
                        className="w-full h-full object-cover transform transition-transform 
                          duration-700 group-hover:scale-110"
                      />
                      {game.discount > 0 && (
                        <div className="absolute top-4 right-4 bg-green-500 text-white 
                          px-3 py-1 rounded-full font-bold transform rotate-3">
                          -{game.discount}%
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1e2837] 
                        to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* 游戏信息 */}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 
                          transition-colors">
                          {game.title}
                        </h3>
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                          <span className="text-white font-medium">{game.rating}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        {game.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-sm rounded-full bg-[#2a475e]/50 
                              text-gray-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          {game.discount > 0 ? (
                            <div className="space-y-1">
                              <div className="text-gray-400 line-through text-sm">
                                ¥{game.originalPrice}
                              </div>
                              <div className="text-green-400 text-xl font-bold">
                                ¥{game.price}
                              </div>
                            </div>
                          ) : (
                            <div className="text-white text-xl font-bold">
                              ¥{game.price}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-full bg-white/5 hover:bg-white/10"
                          >
                            <Heart className="w-5 h-5 text-gray-300" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500
                              hover:from-blue-600 hover:to-purple-600 text-white rounded-lg
                              font-medium transform transition-all duration-300"
                          >
                            购买
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>

            {/* 分页控件 */}
            <div className="mt-12 flex flex-col items-center gap-8">
              {/* 分页统计信息 */}
              <div className="text-gray-400 text-sm">
                显示 {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} 项，共 {totalItems} 项
              </div>

              {/* 分页导航 */}
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-[#1e2837] text-gray-400 hover:text-white
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronFirst className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-[#1e2837] text-gray-400 hover:text-white
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>

                <div className="flex gap-1">
                  {generatePagesArray().map(pageNum => (
                    <motion.button
                      key={pageNum}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors
                        ${currentPage === pageNum 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                          : 'bg-[#1e2837] text-gray-400 hover:text-white'}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-[#1e2837] text-gray-400 hover:text-white
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-[#1e2837] text-gray-400 hover:text-white
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronLast className="w-5 h-5" />
                </motion.button>
              </div>

              {/* 每页显示数量选择器 */}
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span>每页显示</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="bg-[#1e2837] text-white px-3 py-1.5 rounded-lg border border-white/10
                    focus:outline-none focus:border-blue-500"
                >
                  {[12, 24, 36, 48].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
                <span>项</span>
              </div>
            </div>

            {/* 推荐游戏轮播 */}
            <div className="mt-16">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">猜你喜欢</h3>
                <button className="text-blue-400 hover:text-white transition-colors 
                  flex items-center gap-2">
                  查看更多
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendedGames.map((game, index) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-[#1e2837] rounded-xl overflow-hidden"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={game.image}
                        alt={game.title}
                        className="w-full h-full object-cover transform 
                          transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 
                        to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-4 left-4 right-4">
                          <h4 className="text-white font-bold truncate">{game.title}</h4>
                          <p className="text-gray-300 text-sm line-clamp-2">
                            {game.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
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
      </div>
    </div>
  );
};

export default Store;
