// src/pages/store/components/SearchBar/index.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, RefreshCw, ArrowUpDown } from 'lucide-react';
import './styles.css';
import { SORT_OPTIONS } from '../../constants';


// 导出 EmptyState 组件
export const EmptyState = ({ onClearAll }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] py-12 px-4">
      <div className="mb-6 text-gray-300 dark:text-gray-600">
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
};

EmptyState.propTypes = {
  onClearAll: PropTypes.func.isRequired
};

const SearchBar = ({
  value,
  onChange,
  onSearch,
  onSort,
  onClearAll,
  sortBy,
  placeholder = "搜索...",
  showHistory = true,
  maxHistory = 5
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
    <div className="search-bar-outer-container">
      <div className="search-bar-container" ref={containerRef}>
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
        aria-label="排序方式"
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
  );
};

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func,
  onSort: PropTypes.func.isRequired,
  onClearAll: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  showHistory: PropTypes.bool,
  maxHistory: PropTypes.number
};

export default React.memo(SearchBar);