import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import './styles.css';

// 导入常量和组件
import { 
  SORT_OPTIONS, 
  SECURITY_CONFIG,
  ENCRYPTION_KEY,
  MOCK_EVENTS,
  MOCK_STATISTICS,
  MOCK_GAMES,
  MOCK_RECOMMENDED_GAMES
} from './constants';

// 导入子组件
import EventSection from './components/EventSection';
import FilterSection from './components/FilterSection';
import GameSection from './components/GameSection';
import StatisticsCard from './components/StatisticsCard';
import RecommendSection from './components/RecommendSection';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingScreen from '../../components/LoadingScreen';

// 导入通用组件
import Pagination from '../../components/store/Pagination';
import FilterTag from '../../components/store/FilterTag';

const Store = () => {
  const navigate = useNavigate();
  
  // 状态管理
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => 
    localStorage.getItem('darkMode') === 'true'
  );
  const [locale, setLocale] = useState(() => 
    localStorage.getItem('language') || 'zh'
  );
  const [events, setEvents] = useState([]);
  const [games, setGames] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [statistics, setStatistics] = useState([]);
  
  // 过滤和排序状态
  const [filters, setFilters] = useState({
    priceRange: null,
    genres: [],
    tags: [],
    search: ''
  });
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.POPULARITY);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);

  // 加密函数
  const encryptData = (data) => {
    return CryptoJS.AES.encrypt(
      JSON.stringify(data), 
      ENCRYPTION_KEY
    ).toString();
  };

  // 解密函数
  const decryptData = (encryptedData) => {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  };

  // 初始化数据
  useEffect(() => {
    const initializeStore = async () => {
      try {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 设置模拟数据
        setEvents(MOCK_EVENTS);
        setGames(MOCK_GAMES);
        setRecommendations(MOCK_RECOMMENDED_GAMES);
        setStatistics(MOCK_STATISTICS);
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize store:', error);
        // 错误处理
      }
    };

    initializeStore();
  }, []);

  // 处理排序
  const handleSort = (sortOption) => {
    setSortBy(sortOption);
    // 实现排序逻辑
  };

  // 处理过滤
  const handleFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // 处理搜索
  const handleSearch = (searchTerm) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm
    }));
    setCurrentPage(1); // 重置页码
  };

  // 处理分页
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="store-container">
      {/* 导航栏 */}
      <Navbar 
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        locale={locale}
        setLocale={setLocale}
      />

      {/* 主要内容 */}
      <main className="store-content">
        {/* 活动区域 */}
        <EventSection events={events} />

        {/* 统计卡片 */}
        <StatisticsCard statistics={statistics} />

        {/* 主要游戏区域 */}
        <div className="flex gap-8 mt-8">
          {/* 过滤器侧边栏 */}
          <FilterSection 
            filters={filters}
            onFilterChange={handleFilter}
          />

          {/* 游戏列表区域 */}
          <div className="flex-1">
            {/* 排序和搜索 */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold gradient-text">
                全部游戏
              </h2>
              <div className="flex items-center gap-4">
                <input
                  type="search"
                  placeholder="搜索游戏..."
                  className="px-4 py-2 rounded-lg bg-[#1e2837] text-white"
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-[#1e2837] text-white"
                >
                  <option value={SORT_OPTIONS.POPULARITY}>最受欢迎</option>
                  <option value={SORT_OPTIONS.RELEASE_DATE}>最新发布</option>
                  <option value={SORT_OPTIONS.PRICE_ASC}>价格从低到高</option>
                  <option value={SORT_OPTIONS.PRICE_DESC}>价格从高到低</option>
                  <option value={SORT_OPTIONS.RATING}>用户评分</option>
                </select>
              </div>
            </div>

            {/* 游戏网格 */}
            <GameSection 
              games={games}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
            />

            {/* 分页控件 */}
            <Pagination
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={games.length}
              onPageChange={handlePageChange}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        </div>

        {/* 推荐游戏区域 */}
        <RecommendSection games={recommendations} />
      </main>

      {/* 页脚 */}
      <Footer darkMode={darkMode} />
    </div>
  );
};

export default Store;