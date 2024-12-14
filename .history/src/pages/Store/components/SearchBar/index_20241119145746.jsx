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

  // 过滤和排序逻辑
  const filteredAndSortedGames = useMemo(() => {
    try {
      let results = [...games];
      if (filters.search) {
        results = handleSearchFilter(results, filters.search);
      }
      results = handlePriceFilter(results, filters.priceRange, PRICE_RANGES);
      results = handleGenreFilter(results, filters.genres);
      results = handleTagFilter(results, filters.tags);
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
  };

  // 处理过滤
  const handleFilter = (filterType, value) => {
    setFilters(prev => {
      try {
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

  // 清除所有筛选条件
  const handleClearAllFilters = () => {
    setFilters({
      priceRange: '',
      genres: [],
      tags: [],
      search: ''
    });
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
            <SearchBar
              value={filters.search}
              onChange={handleSearch}
              onSearch={handleSearch}
              onSort={handleSort}
              onFilterChange={handleFilter}
              onClearAll={handleClearAllFilters}
              filters={filters}
              sortBy={sortBy}
              totalResults={filteredAndSortedGames.length}
              placeholder="搜索游戏..."
              showHistory={true}
              maxHistory={5}
              showEmptyState={filteredAndSortedGames.length === 0}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentPage}-${sortBy}-${JSON.stringify(filters)}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {filteredAndSortedGames.length > 0 && (
                  <GameSection 
                    games={filteredAndSortedGames}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                  />
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