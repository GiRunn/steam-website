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

import {
  handleSearchFilter,
  handlePriceFilter,
  handleGenreFilter,
  handleTagFilter,
  handleGameSort,
  calculateFilterCounts
} from './utils/storeUtils';

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
  
  // 基础状态
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
  
  // 搜索、过滤和排序状态
  const [filters, setFilters] = useState({
    priceRange: '',
    genres: [],
    tags: [],
    search: ''
  });
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.POPULARITY);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);

  // 初始化数据
  useEffect(() => {
    const initializeStore = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 初始化数据
        setEvents(MOCK_EVENTS);
        setGames(MOCK_GAMES);
        setRecommendations(MOCK_RECOMMENDED_GAMES);
        setStatistics(MOCK_STATISTICS);
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize store:', error);
        // 可以添加错误处理UI
      }
    };

    initializeStore();
  }, []);

  // 过滤和排序逻辑
  const filteredAndSortedGames = useMemo(() => {
    try {
      let results = [...games];

      // 1. 应用搜索过滤
      if (filters.search) {
        results = handleSearchFilter(results, filters.search);
      }

      // 2. 应用价格过滤
      results = handlePriceFilter(results, filters.priceRange, PRICE_RANGES);

      // 3. 应用类型过滤
      results = handleGenreFilter(results, filters.genres);

      // 4. 应用标签过滤
      results = handleTagFilter(results, filters.tags);

      // 5. 应用排序
      return handleGameSort(results, sortBy, SORT_OPTIONS);

    } catch (error) {
      console.error('Error filtering and sorting games:', error);
      return [];
    }
  }, [games, filters, sortBy]);

  // 过滤器统计信息
  const filterCounts = useMemo(() => {
    return calculateFilterCounts(games, filters, PRICE_RANGES);
  }, [games, filters]);

  // 处理搜索
  const handleSearch = (searchTerm) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm
    }));
    setCurrentPage(1);
    
    // 更新搜索历史
    if (searchTerm.trim()) {
      try {
        const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        const newHistory = [
          searchTerm,
          ...searchHistory.filter(term => term !== searchTerm)
        ].slice(0, 5);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      } catch (error) {
        console.error('Error updating search history:', error);
      }
    }
  };

  // 处理过滤
  const handleFilter = (filterType, value) => {
    setFilters(prev => {
      try {
        // 处理数组类型的过滤器
        if (Array.isArray(prev[filterType])) {
          if (Array.isArray(value)) {
            return { ...prev, [filterType]: value };
          }
          
          const isExist = prev[filterType].includes(value);
          return {
            ...prev,
            [filterType]: isExist
              ? prev[filterType].filter(item => item !== value)
              : [...prev[filterType], value]
          };
        }
        
        // 处理单值过滤器
        return {
          ...prev,
          [filterType]: prev[filterType] === value ? '' : value
        };
      } catch (error) {
        console.error('Error handling filter:', error);
        return prev;
      }
    });
    setCurrentPage(1);
  };

  // 处理排序
  const handleSort = (sortOption) => {
    setSortBy(sortOption);
  };

  // 处理分页
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
            filterCounts={filterCounts}
            onFilterChange={handleFilter}
          />

          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold gradient-text">
                全部游戏 ({filteredAndSortedGames.length})
              </h2>
              

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
              {filters.search && (
                <FilterTag
                  label={`搜索: ${filters.search}`}
                  onRemove={() => handleSearch('')}
                />
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentPage}-${sortBy}-${JSON.stringify(filters)}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {filteredAndSortedGames.length > 0 ? (
                  <GameSection 
                    games={filteredAndSortedGames}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[400px] py-12 px-4">
                    <div className="mb-6 text-gray-300 dark:text-gray-600">
                      <svg 
                        className="w-24 h-24 animate-float" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.5"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                        />
                      </svg>
                    </div>

                    <div className="text-center max-w-md mb-8">
                      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        没有找到符合条件的游戏
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        尝试使用不同的筛选条件或清除当前的筛选条件来查看更多游戏
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setFilters({
                          priceRange: '',
                          genres: [],
                          tags: [],
                          search: ''
                        });
                        setCurrentPage(1);
                      }}
                      className="
                        inline-flex items-center px-6 py-3
                        bg-gradient-to-r from-blue-500 to-indigo-600
                        hover:from-blue-600 hover:to-indigo-700
                        text-white font-medium rounded-lg
                        transition-all duration-200 ease-in-out
                        transform hover:scale-105 hover:shadow-lg
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                      "
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      清除所有筛选条件
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {filteredAndSortedGames.length > 0 && (
              <Pagination
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredAndSortedGames.length}
                onPageChange={handlePageChange}
                onItemsPerPageChange={setItemsPerPage}
                showQuickJump={true}
                showSizeChanger={true}
                pageSizeOptions={[12, 24, 48, 96]}
              />
            )}
          </div>
        </div>

        {!filters.search && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <RecommendSection games={recommendations} />
          </motion.div>
        )}
      </main>

      <Footer darkMode={darkMode} />
    </div>
  );
};

export default Store;