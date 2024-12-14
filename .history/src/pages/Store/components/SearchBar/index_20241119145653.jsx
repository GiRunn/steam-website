// src/pages/store/components/SearchBar/index.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, RefreshCw } from 'lucide-react';
import { SORT_OPTIONS, PRICE_RANGES } from '../../constants';
import FilterTag from '../FilterTag';
import './styles.css';

// 空状态组件
const EmptyState = ({ onClearAll }) => (
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
      onClick={onClearAll}
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
      <RefreshCw className="w-5 h-5 mr-2" />
      清除所有筛选条件
    </button>
  </div>
);

// 活动过滤标签组
const ActiveFilters = ({ filters, onFilterChange, onSearch }) => (
  <div className="flex flex-wrap gap-2 mt-4">
    {filters.priceRange && (
      <FilterTag
        label={PRICE_RANGES.find(r => r.id === filters.priceRange)?.label}
        onRemove={() => onFilterChange('priceRange', '')}
      />
    )}
    {filters.genres.map(genre => (
      <FilterTag
        key={genre}
        label={genre}
        onRemove={() => onFilterChange('genres', 
          filters.genres.filter(g => g !== genre)
        )}
      />
    ))}
    {filters.tags.map(tag => (
      <FilterTag
        key={tag}
        label={tag}
        onRemove={() => onFilterChange('tags',
          filters.tags.filter(t => t !== tag)
        )}
      />
    ))}
    {filters.search && (
      <FilterTag
        label={`搜索: ${filters.search}`}
        onRemove={() => onSearch('')}
      />
    )}
  </div>
);

// 主搜索栏组件
const SearchBar = ({
  value,
  onChange,
  onSearch,
  onSort,
  onFilterChange,
  onClearAll,
  filters,
  sortBy,
  totalResults = 0,
  placeholder = "搜索游戏...",
  showHistory = true,
  maxHistory = 5,
  showEmptyState = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('searchHistory');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error loading search history:', error);
      return [];
    }
  });
  
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onSearch?.(newValue.trim().toLowerCase());
  };

  const updateSearchHistory = useCallback((searchTerm) => {
    const normalizedTerm = searchTerm.trim();
    if (!normalizedTerm) return;

    try {
      const filteredHistory = searchHistory.filter(
        term => term.toLowerCase() !== normalizedTerm.toLowerCase()
      );
      
      const newHistory = [normalizedTerm, ...filteredHistory].slice(0, maxHistory);
      
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error updating search history:', error);
    }
  }, [searchHistory, maxHistory]);

  const executeSearch = useCallback((searchTerm) => {
    const normalizedTerm = searchTerm.trim();
    if (normalizedTerm) {
      onChange(normalizedTerm);
      updateSearchHistory(normalizedTerm);
    }
  }, [onChange, updateSearchHistory]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      executeSearch(inputValue);
      setIsFocused(false);
    }
  };

  const handleSearchClick = () => {
    if (inputValue.trim()) {
      executeSearch(inputValue);
      setIsFocused(false);
    }
  };

  const clearSearch = useCallback(() => {
    setInputValue('');
    onChange('');
    onSearch?.('');
    inputRef.current?.focus();
  }, [onChange, onSearch]);

  const clearHistory = useCallback((e) => {
    e.stopPropagation();
    setSearchHistory([]);
    try {
      localStorage.removeItem('searchHistory');
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }, []);

  const handleHistoryItemClick = useCallback((term) => {
    setInputValue(term);
    executeSearch(term);
    setIsFocused(false);
  }, [executeSearch]);

  return (
    <div className="search-section">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold gradient-text">
          全部游戏 ({totalResults})
        </h2>
        
        <div className="search-bar-outer-container" ref={containerRef}>
          <div className="search-bar-container">
            <div className="search-input-wrapper">
              <button 
                className="search-icon-button"
                onClick={handleSearchClick}
                aria-label="搜索"
              >
                <Search className="search-icon" size={16} />
              </button>
              
              <motion.input
                ref={inputRef}
                type="text"
                className="search-input"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                onFocus={() => setIsFocused(true)}
                placeholder={placeholder}
                whileFocus={{ scale: 1.01 }}
                aria-label="搜索输入框"
              />
              
              <AnimatePresence>
                {inputValue && (
                  <motion.button
                    className="clear-button"
                    onClick={clearSearch}
                    aria-label="清除搜索"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={14} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {isFocused && showHistory && searchHistory.length > 0 && (
                <motion.div
                  className="search-history"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  role="list"
                  aria-label="搜索历史"
                >
                  <div className="history-header">
                    <span className="history-title">
                      <Clock size={14} className="history-title-icon" />
                      搜索历史
                    </span>
                    <button 
                      className="clear-history" 
                      onClick={clearHistory}
                      aria-label="清除历史记录"
                    >
                      清除
                    </button>
                  </div>
                  
                  {searchHistory.map((term, index) => (
                    <motion.button
                      key={`${term}-${index}`}
                      className="history-item"
                      onClick={() => handleHistoryItemClick(term)}
                      whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                      whileTap={{ scale: 0.98 }}
                      role="listitem"
                    >
                      <Search size={14} className="history-icon" />
                      <span className="history-term">{term}</span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="search-actions">
            <select
              value={sortBy}
              onChange={(e) => onSort(e.target.value)}
              className="sort-select"
            >
              <option value={SORT_OPTIONS.POPULARITY}>最受欢迎</option>
              <option value={SORT_OPTIONS.RELEASE_DATE}>最新发布</option>
              <option value={SORT_OPTIONS.PRICE_ASC}>价格从低到高</option>
              <option value={SORT_OPTIONS.PRICE_DESC}>价格从高到低</option>
              <option value={SORT_OPTIONS.RATING}>用户评分</option>
            </select>

            <motion.button
              className="clear-filters-button"
              onClick={onClearAll}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw size={16} className="mr-2" />
              清空筛选
            </motion.button>
          </div>
        </div>
      </div>

      <ActiveFilters 
        filters={filters} 
        onFilterChange={onFilterChange}
        onSearch={onSearch}
      />

      {showEmptyState && totalResults === 0 && (
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <EmptyState onClearAll={onClearAll} />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func,
  onSort: PropTypes.func.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onClearAll: PropTypes.func.isRequired,
  filters: PropTypes.shape({
    priceRange: PropTypes.string,
    genres: PropTypes.arrayOf(PropTypes.string),
    tags: PropTypes.arrayOf(PropTypes.string),
    search: PropTypes.string
  }).isRequired,
  sortBy: PropTypes.string.isRequired,
  totalResults: PropTypes.number,
  placeholder: PropTypes.string,
  showHistory: PropTypes.bool,
  maxHistory: PropTypes.number,
  showEmptyState: PropTypes.bool
};

export default React.memo(SearchBar);