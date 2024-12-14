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

  // 计算模糊匹配得分
  const calculateFuzzyScore = (str1, str2) => {
    if (!str1 || !str2) return 0;
    
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    // 精确匹配
    if (s1 === s2) return 1;
    
    // 包含关系匹配
    if (s1.includes(s2)) return 0.9;
    if (s2.includes(s1)) return 0.8;

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

  // 优化的过滤和搜索逻辑
  const filteredAndScoredGames = useMemo(() => {
    let results = [...games];
    
    try {
      // 1. 搜索过滤
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase().trim();
        
        results = results.map(game => {
          // 计算多维度搜索得分
          const searchScores = {
            exactMatch: game.title.toLowerCase() === searchTerm ? 100 : 0,
            titleContains: game.title.toLowerCase().includes(searchTerm) ? 80 : 0,
            tagMatch: game.tags?.some(tag => 
              tag.toLowerCase().includes(searchTerm)) ? 60 : 0,
            aliasMatch: game.aliases?.some(alias => 
              alias.toLowerCase().includes(searchTerm)) ? 50 : 0,
            pinyinMatch: game.pinyin?.some(py => 
              py.toLowerCase().includes(searchTerm)) ? 40 : 0,
            fuzzyMatch: calculateFuzzyScore(game.title, searchTerm) * 30,
            // 数字匹配特殊处理
            numberMatch: (/\d/.test(searchTerm) && 
              game.title.match(/\d+/g)?.some(num => 
                searchTerm.includes(num))) ? 70 : 0
          };

          // 计算最终搜索得分
          const searchScore = Math.max(
            searchScores.exactMatch,
            searchScores.titleContains,
            searchScores.tagMatch,
            searchScores.aliasMatch,
            searchScores.pinyinMatch,
            searchScores.fuzzyMatch,
            searchScores.numberMatch
          );

          return {
            ...game,
            searchScore
          };
        }).filter(game => game.searchScore > 20) // 过滤掉相关性太低的结果
          .sort((a, b) => b.searchScore - a.searchScore); // 按相关性排序
      }

      // 2. 价格区间过滤
      if (filters.priceRange) {
        const range = PRICE_RANGES.find(r => r.id === filters.priceRange);
        if (range) {
          results = results.filter(game => {
            const price = Number(game.price);
            if (range.max === null) {
              return price >= range.min;
            }
            return price >= range.min && price <= range.max;
          });
        }
      }

      // 3. 游戏类型过滤
      if (filters.genres.length > 0) {
        results = results.filter(game =>
          filters.genres.some(genre => 
            game.genres.map(g => g.toLowerCase())
              .includes(genre.toLowerCase())
          )
        );
      }

      // 4. 标签过滤
      if (filters.tags.length > 0) {
        results = results.filter(game =>
          filters.tags.every(tag =>
            game.tags.some(t => 
              t.toLowerCase().includes(tag.toLowerCase())
            )
          )
        );
      }

    } catch (error) {
      console.error('Error in filtering games:', error);
      return []; // 发生错误时返回空数组
    }

    return results;
  }, [games, filters]);

  // 过滤器统计信息
  const filterCounts = useMemo(() => {
    const counts = {
      priceRanges: {},
      genres: {},
      tags: {}
    };

    try {
      // 获取符合当前搜索条件的基础结果集
      let baseResults = [...games];
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase().trim();
        baseResults = baseResults.filter(game => {
          const searchScore = Math.max(
            game.title.toLowerCase() === searchTerm ? 100 : 0,
            game.title.toLowerCase().includes(searchTerm) ? 80 : 0,
            game.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ? 60 : 0,
            game.aliases?.some(alias => alias.toLowerCase().includes(searchTerm)) ? 50 : 0,
            game.pinyin?.some(py => py.toLowerCase().includes(searchTerm)) ? 40 : 0,
            calculateFuzzyScore(game.title, searchTerm) * 30
          );
          return searchScore > 20;
        });
      }

      // 统计各维度的数量
      baseResults.forEach(game => {
        // 价格区间统计
        PRICE_RANGES.forEach(range => {
          const price = Number(game.price);
          const inRange = range.max === null 
            ? price >= range.min
            : price >= range.min && price <= range.max;
          
          if (inRange) {
            counts.priceRanges[range.id] = (counts.priceRanges[range.id] || 0) + 1;
          }
        });

        // 游戏类型统计
        game.genres.forEach(genre => {
          const genreKey = genre.toLowerCase();
          counts.genres[genreKey] = (counts.genres[genreKey] || 0) + 1;
        });

        // 标签统计
        game.tags.forEach(tag => {
          const tagKey = tag.toLowerCase();
          counts.tags[tagKey] = (counts.tags[tagKey] || 0) + 1;
        });
      });

    } catch (error) {
      console.error('Error calculating filter counts:', error);
    }

    return counts;
  }, [games, filters.search]);

  // 排序逻辑
  const sortedGames = useMemo(() => {
    return [...filteredAndScoredGames].sort((a, b) => {
      try {
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
            // 如果有搜索得分，优先按搜索得分排序
            if (a.searchScore && b.searchScore) {
              return b.searchScore - a.searchScore;
            }
            return b.popularity - a.popularity;
        }
      } catch (error) {
        console.error('Error sorting games:', error);
        return 0;
      }
    });
  }, [filteredAndScoredGames, sortBy]);

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
                {sortedGames.length > 0 ? (
                  <GameSection 
                    games={sortedGames}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[400px] py-12 px-4">

                    {/* 文字信息区域 */}
                    <div className="text-center max-w-md mb-8">
                      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        没有找到符合条件的游戏
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        尝试使用不同的筛选条件或清除当前的筛选条件来查看更多游戏
                      </p>
                    </div>

                    {/* 操作按钮 */}
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

            {sortedGames.length > 0 && (
              <Pagination
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={sortedGames.length}
                onPageChange={handlePageChange}
                onItemsPerPageChange={setItemsPerPage}
                showQuickJump={true}
                showSizeChanger={true}
                pageSizeOptions={[12, 24, 48, 96]}
              />
            )}
          </div>
        </div>

        {/* 只在未搜索时显示推荐区域 */}
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