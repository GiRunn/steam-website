import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import './styles.css';

import { 
  SORT_OPTIONS, 
  SECURITY_CONFIG,
  ENCRYPTION_KEY,
  MOCK_EVENTS,
  MOCK_STATISTICS,
  MOCK_GAMES,
  MOCK_RECOMMENDED_GAMES,
  PRICE_RANGES,
} from './constants';

import EventSection from './components/EventSection';
import FilterSection from './components/FilterSection';
import GameSection from './components/GameSection';
import StatisticsCard from './components/StatisticsCard';
import RecommendSection from './components/RecommendSection';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingScreen from '../../components/LoadingScreen';
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
    priceRange: '',
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
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setEvents(MOCK_EVENTS);
        setGames(MOCK_GAMES);
        setRecommendations(MOCK_RECOMMENDED_GAMES);
        setStatistics(MOCK_STATISTICS);
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize store:', error);
      }
    };

    initializeStore();
  }, []);

  // 使用 useMemo 缓存过滤后的游戏列表
  const filteredGames = useMemo(() => {
    return MOCK_GAMES.filter(game => {
      // 搜索过滤
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        if (!game.title.toLowerCase().includes(searchTerm) &&
            !game.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
          return false;
        }
      }

      // 价格区间过滤
      if (filters.priceRange) {
        const range = PRICE_RANGES.find(r => r.id === filters.priceRange);
        if (range) {
          const price = game.price;
          if (range.max === null) {
            if (price < range.min) return false;
          } else if (price < range.min || price > range.max) {
            return false;
          }
        }
      }

      // 游戏类型过滤
      if (filters.genres.length > 0) {
        if (!game.tags.some(tag => 
          filters.genres.includes(tag.toLowerCase())
        )) {
          return false;
        }
      }

      // 特殊标签过滤
      if (filters.tags.length > 0) {
        if (!filters.tags.every(tag => 
          game.features.some(f => f.toLowerCase().includes(tag))
        )) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  // 排序处理
  const sortedGames = useMemo(() => {
    const sorted = [...filteredGames];
    switch (sortBy) {
      case SORT_OPTIONS.PRICE_ASC:
        return sorted.sort((a, b) => a.price - b.price);
      case SORT_OPTIONS.PRICE_DESC:
        return sorted.sort((a, b) => b.price - a.price);
      case SORT_OPTIONS.RELEASE_DATE:
        return sorted.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
      case SORT_OPTIONS.RATING:
        return sorted.sort((a, b) => b.rating - a.rating);
      case SORT_OPTIONS.POPULARITY:
      default:
        return sorted;
    }
  }, [filteredGames, sortBy]);

  // 处理排序
  const handleSort = (sortOption) => {
    setSortBy(sortOption);
  };

  // 处理过滤
  const handleFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
  };

  // 处理搜索
  const handleSearch = (searchTerm) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm
    }));
    setCurrentPage(1);
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
    <div className={`store-container ${darkMode ? 'dark' : ''}`}>
      <Navbar 
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        locale={locale}
        setLocale={setLocale}
      />

      <main className="store-content">
        <EventSection events={events} />
        <StatisticsCard statistics={statistics} />

        <div className="flex gap-8 mt-8">
          <FilterSection 
            filters={filters}
            onFilterChange={handleFilter}
          />

          <div className="flex-1">


            <div className="active-filters">
              {filters.priceRange && (
                <FilterTag
                  label={PRICE_RANGES.find(r => r.id === filters.priceRange)?.label}
                  onRemove={() => handleFilter('priceRange', '')}
                />
              )}
              {filters.genres.map(genre => (
                <FilterTag
                  key={genre}
                  label={genre}
                  onRemove={() => handleFilter('genres', 
                    filters.genres.filter(g => g !== genre)
                  )}
                />
              ))}
              {filters.tags.map(tag => (
                <FilterTag
                  key={tag}
                  label={tag}
                  onRemove={() => handleFilter('tags',
                    filters.tags.filter(t => t !== tag)
                  )}
                />
              ))}
            </div>

            <GameSection 
              games={sortedGames}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
            />

            <Pagination
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={sortedGames.length}
              onPageChange={handlePageChange}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        </div>

        <RecommendSection games={recommendations} />
      </main>

      <Footer darkMode={darkMode} />
    </div>
  );
};

export default Store;