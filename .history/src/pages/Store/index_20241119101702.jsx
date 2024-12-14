// src/pages/store/index.jsx
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
import SearchBar from './components/SearchBar'; // 新增导入
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
      try {
        // 搜索过滤
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase().trim();
          
          if (!searchTerm) {
            return true;
          }
  
          // 定义简单的清理函数 - 处理特殊字符和空格
          const cleanString = (str) => str.toLowerCase()
            .replace(/[\s-_]+/g, '')  // 移除空格、破折号和下划线
            .replace(/[^\w\d]/g, ''); // 只保留字母和数字
  
          const cleanedSearch = cleanString(searchTerm);
          const cleanedTitle = cleanString(game.title);
          
          // 1. 精确标题匹配（最高优先级）
          if (cleanedTitle === cleanedSearch) {
            return true;
          }
  
          // 2. 开头匹配
          if (cleanedTitle.startsWith(cleanedSearch)) {
            return true;
          }
  
          // 3. 数字和字母的组合匹配（针对类似2take1这样的情况）
          const alphanumericPattern = /^(?=.*\d)(?=.*[a-zA-Z])/; // 包含数字和字母
          if (alphanumericPattern.test(searchTerm)) {
            // 特殊处理数字字母混合的情况
            const searchParts = searchTerm.match(/\d+|\D+/g) || [];
            const titleParts = game.title.match(/\d+|\D+/g) || [];
            
            const allPartsMatch = searchParts.every(part => 
              titleParts.some(titlePart => 
                cleanString(titlePart) === cleanString(part)
              )
            );
            
            if (allPartsMatch) {
              return true;
            }
          }
  
          // 4. 部分标题包含匹配
          if (cleanedTitle.includes(cleanedSearch)) {
            return true;
          }
  
          // 5. 标签匹配
          const hasMatchingTag = game.tags?.some(tag => 
            cleanString(tag).includes(cleanedSearch)
          );
          if (hasMatchingTag) {
            return true;
          }
  
          // 6. 别名匹配（如英文名、缩写等）
          if (game.aliases?.some(alias => 
            cleanString(alias).includes(cleanedSearch)
          )) {
            return true;
          }
  
          // 未找到匹配
          return false;
        }
  
        // 其他过滤条件保持不变
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
  
        if (filters.genres.length > 0) {
          if (!game.tags.some(tag => 
            filters.genres.includes(tag.toLowerCase())
          )) {
            return false;
          }
        }
  
        if (filters.tags.length > 0) {
          if (!filters.tags.every(tag => 
            game.features.some(f => f.toLowerCase().includes(tag.toLowerCase()))
          )) {
            return false;
          }
        }
  
        return true;
      } catch (error) {
        console.error('Game filtering error:', error);
        return false;
      }
    });
  }, [filters]);
  
  // 辅助函数：计算模糊匹配得分（0-1之间,1表示完全匹配）
  const calculateFuzzyScore = (str1, str2) => {
    if (typeof str1 !== 'string' || typeof str2 !== 'string') {
      return 0;
    }
  
    const len1 = str1.length;
    const len2 = str2.length;
    
    if (len1 === 0 || len2 === 0) {
      return 0;
    }
  
    // 使用较短的字符串作为搜索词
    const [short, long] = len1 < len2 ? [str1, str2] : [str2, str1];
    let matched = 0;
    let position = 0;
  
    // 计算连续匹配字符
    for (const char of short) {
      const nextPos = long.indexOf(char, position);
      if (nextPos !== -1) {
        matched++;
        position = nextPos + 1;
      }
    }
  
    // 返回匹配比例
    return matched / short.length;
  };

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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold gradient-text">
                全部游戏 ({sortedGames.length})
              </h2>
              
              <div className="search-sort-container">
                <SearchBar
                  value={filters.search}
                  onChange={handleSearch}
                  placeholder="搜索游戏..."
                  showHistory={true}
                  maxHistory={5}
                />
                
                <select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                  className="sort-select"
                >
                  <option value={SORT_OPTIONS.POPULARITY}>最受欢迎</option>
                  <option value={SORT_OPTIONS.RELEASE_DATE}>最新发布</option>
                  <option value={SORT_OPTIONS.PRICE_ASC}>价格从低到高</option>
                  <option value={SORT_OPTIONS.PRICE_DESC}>价格从高到低</option>
                  <option value={SORT_OPTIONS.RATING}>用户评分</option>
                </select>
              </div>
            </div>

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