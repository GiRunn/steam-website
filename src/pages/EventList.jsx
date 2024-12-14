// pages/EventList.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Calendar,
  Clock,
  Filter,
  Search,
  Tag,
  ChevronDown,
  Bell,
  TrendingUp,
  Star,
  Calendar as CalendarIcon,
  LayoutGrid,
  LayoutList,
  SlidersHorizontal
} from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';

// 顶部横幅组件
const EventBanner = () => (
  <motion.div 
    initial={{ opacity: 0, y: -100 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative h-[300px] overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600">
      {/* 动态背景效果 */}
      <motion.div
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
          opacity: [0.5, 0.3, 0.5]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: 'reverse'
        }}
        className="absolute inset-0 bg-grid-pattern opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}
      />
    </div>
    <div className="relative container mx-auto px-6 h-full flex flex-col items-center justify-center text-center">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-5xl font-bold text-white mb-4"
      >
        活动中心
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg text-white/90 max-w-2xl"
      >
        发现精彩活动，参与互动赢取奖励
      </motion.p>
    </div>
  </motion.div>
);

// 筛选器组件
const FilterSection = ({ filters, activeFilter, setActiveFilter }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#1e2837] rounded-xl p-6 mb-8"
  >
    <div className="flex flex-wrap gap-4">
      {filters.map((filter, index) => (
        <motion.button
          key={filter.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveFilter(filter.id)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all
            ${activeFilter === filter.id
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
              : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
        >
          <filter.icon className="w-4 h-4" />
          <span>{filter.label}</span>
          {filter.count && (
            <span className="px-2 py-0.5 bg-white/10 rounded-full text-sm">
              {filter.count}
            </span>
          )}
        </motion.button>
      ))}
    </div>
  </motion.div>
);

// 搜索栏组件
const SearchBar = ({ onSearch }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative mb-8"
  >
    <div className="relative">
      <input
        type="text"
        placeholder="搜索活动..."
        className="w-full h-12 pl-12 pr-4 rounded-xl bg-[#1e2837] text-white 
          placeholder-gray-400 outline-none border border-white/10 focus:border-blue-500
          transition-all"
      />
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
    </div>
  </motion.div>
);

// 活动卡片组件
const EventCard = ({ event, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -5 }}
    className="bg-[#1e2837] rounded-xl overflow-hidden group"
  >
    <Link to={`/event/${event.id}`}>
      <div className="relative aspect-[2/1] overflow-hidden">
        <motion.img
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e2837] to-transparent" />
        
        {/* 活动状态标签 */}
        <div className="absolute top-4 right-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className={`px-3 py-1 rounded-full text-sm font-medium
              ${event.status === 'upcoming' ? 'bg-blue-500' : 
                event.status === 'active' ? 'bg-green-500' : 'bg-gray-500'} 
              text-white`}
          >
            {event.status === 'upcoming' ? '即将开始' : 
             event.status === 'active' ? '进行中' : '已结束'}
          </motion.div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 
          transition-colors">
          {event.title}
        </h3>
        <p className="text-gray-400 mb-4 line-clamp-2">{event.description}</p>
        
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{event.time}</span>
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

// 分页组件
const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex justify-center items-center gap-2 mt-12"
  >
    {Array.from({ length: totalPages }).map((_, index) => (
      <motion.button
        key={index}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onPageChange(index + 1)}
        className={`w-10 h-10 rounded-lg flex items-center justify-center
          ${currentPage === index + 1
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
            : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
      >
        {index + 1}
      </motion.button>
    ))}
  </motion.div>
);

// 主组件
const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [darkMode, setDarkMode] = useState(() => 
    localStorage.getItem('darkMode') === 'true'
  );
  const [locale, setLocale] = useState(() => 
    localStorage.getItem('locale') || 'zh'
  );

  // 筛选器选项
  const filters = [
    { id: 'all', label: '全部活动', icon: Tag, count: 12 },
    { id: 'upcoming', label: '即将开始', icon: Calendar, count: 5 },
    { id: 'active', label: '进行中', icon: Star, count: 3 },
    { id: 'ended', label: 'TrendingUp', icon: TrendingUp, count: 4 }
  ];

  // 获取活动数据
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        // 模拟API调用
        setTimeout(() => {
          const mockEvents = Array.from({ length: 12 }, (_, i) => ({
            id: i + 1,
            title: `活动 ${i + 1}`,
            description: "精彩活动描述...",
            image: `https://picsum.photos/800/400?random=${i}`,
            date: "2024-02-10",
            time: "10:00",
            status: i < 5 ? 'upcoming' : i < 8 ? 'active' : 'ended'
          }));
          setEvents(mockEvents);
          setLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error fetching events:', error);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
        locale={locale}
        toggleLocale={() => setLocale(locale === 'en' ? 'zh' : 'en')}
      />

      <EventBanner />

      <div className="container mx-auto px-6 py-12">
        {/* 工具栏 */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">全部活动</h2>
          
          <div className="flex items-center gap-4">
            {/* 视图切换 */}
            <div className="flex items-center gap-2 bg-[#1e2837] rounded-lg p-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${
                  viewMode === 'grid' 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-400'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${
                  viewMode === 'list' 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-400'
                }`}
              >
                <LayoutList className="w-5 h-5" />
              </motion.button>
            </div>

            {/* 排序按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-[#1e2837] 
                rounded-lg text-gray-400 hover:text-white"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>排序</span>
            </motion.button>
          </div>
        </div>

        <SearchBar />
        <FilterSection 
          filters={filters}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />

        {/* 活动网格 */}
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {events.map((event, index) => (
            <EventCard key={event.id} event={event} index={index} />
          ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(events.length / 9)}
          onPageChange={setCurrentPage}
        />
      </div>

      <Footer
        darkMode={darkMode}
        locale={locale}
        showVideo={false}
        setShowVideo={() => {}}
        showScrollTop={true}
      />
    </div>
  );
};

export default EventList;