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
import SearchBar from './components/SearchBar';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingScreen from '../../components/LoadingScreen';
import Pagination from '../../components/store/Pagination';
import FilterTag from '../../components/store/FilterTag';

const Store = () => {
  const navigate = useNavigate();
  
  // 基础状态管理
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => 
    localStorage.getItem('darkMode') === 'true'
  );
  const [locale, setLocale] = useState(() => 
    localStorage.getItem('language') || 'zh'
  );
  
  // 数据状态
  const [events, setEvents] = useState([]);
  const [games, setGames] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [statistics, setStatistics] = useState([]);
  
  // 搜索和过滤状态
  const [filters, setFilters] = useState({
    priceRange: '',
    genres: [],
    tags: [],
    search: ''
  });
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.POPULARITY);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);

  // 计算模糊匹配得分
  const calculateFuzzyScore = (str1, str2) => {
    if (!str1 || !str2) return 0;
    
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    // 精确匹配
    if (s1 === s2) return 1;
    
    // 包含匹配
    if (s1.includes(s2) || s2.includes(s1)) {
      return 0.9;
    }

    // 计算编辑距离
    const matrix = Array(s1.length + 1).fill().map(() => 
      Array(s2.length + 1).fill(0)
    );
    
    for (let i = 0; i <= s1.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= s2.length; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= s1.length; i++) {
      for (let j = 1; j <= s2.length; j++) {
        matrix[i][j] = Math.min(
          matrix[i-1][j-1] + (s1[i-1] === s2[j-1] ? 0 : 1),
          matrix[i-1][j] + 1,
          matrix[i][j-1] + 1
        );
      }
    }
    
    const maxLength = Math.max(s1.length, s2.length);
    return (maxLength - matrix[s1.length][s2.length]) / maxLength;
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

  // 过滤和搜索逻辑
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      let matchesSearch = true;
      let matchesPriceRange = true;
      let matchesGenres = true;
      let matchesTags = true;

      // 搜索匹配逻辑
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase().trim();
        
        // 创建搜索匹配分数数组
        const searchScores = [
          // 完全匹配标题
          game.title.toLowerCase() === searchTerm ? 1 : 0,
          
          // 标题包含搜索词
          game.title.toLowerCase().includes(searchTerm) ? 0.9 : 0,
          
          // 标签匹配
          game.tags?.some(tag => 
            tag.toLowerCase().includes(searchTerm)
          ) ? 0.8 : 0,
          
          // 别名匹配
          game.aliases?.some(alias => 
            alias.toLowerCase().includes(searchTerm)
          ) ? 0.7 : 0,
          
          // 拼音匹配
          game.pinyin?.some(py => 
            py.toLowerCase().includes(searchTerm)
          ) ? 0.6 : 0,
          
          // 数字匹配
          (/\d/.test(searchTerm) && game.title.match(/\d+/g)?.some(num => 
            searchTerm.includes(num)
          )) ? 0.8 : 0,
          
          // 模糊匹配
          calculateFuzzyScore(game.title, searchTerm)
        ];

        // 如果最高分低于阈值,则不匹配
        matchesSearch = Math.max(...searchScores) > 0.5;
      }

      // 价格范围匹配
      if (filters.priceRange) {
        const range = PRICE_RANGES.find(r => r.id === filters.priceRange);
        if (range) {
          if (range.max === null) {
            matchesPriceRange = game.price >= range.min;
          } else {
            matchesPriceRange = game.price >= range.min && game.price <= range.max;
          }
        }
      }

      // 游戏类型匹配
      if (filters.genres.length > 0) {
        matchesGenres = filters.genres.some(genre => 
          game.genres.map(g => g.toLowerCase()).includes(genre.toLowerCase())
        );
      }

      // 标签匹配
      if (filters.tags.length > 0) {
        matchesTags = filters.tags.every(tag => 
          game.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
        );
      }

      // 所有条件都满足才返回true
      return matchesSearch && matchesPriceRange && matchesGenres && matchesTags;
    });
  }, [games, filters]);

  // 排序逻辑
  const sortedGames = useMemo(() => {
    return [...filteredGames].sort((a, b) => {
      switch (sortBy) {
        case SORT_OPTIONS.PRICE_ASC:
          return a.price - b.price;
        case SORT_OPTIONS.PRICE_DESC:
          return b.price - a.price;
        case SORT_OPTIONS.RELEASE_DATE:
          return new Date(b.releaseDate) - new Date(a.releaseDate);
        case SORT_OPTIONS.RATING:
          return b.rating - a.rating;
        case SORT_OPTIONS.POPULARITY:
        default:
          return b.popularity - a.popularity;
      }
    });
  }, [filteredGames, sortBy]);

  // 处理函数
  const handleSort = (sortOption) => {
    setSortBy(sortOption);
  };

  const handleFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1); // 重置页码
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm
    }));
    setCurrentPage(1); // 重置页码
    
    // 保存搜索历史
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    if (searchTerm.trim() && !searchHistory.includes(searchTerm)) {
      const newHistory = [searchTerm, ...searchHistory].slice(0, 5);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // 加载状态
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