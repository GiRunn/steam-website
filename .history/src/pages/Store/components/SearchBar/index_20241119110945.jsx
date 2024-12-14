// src/components/SearchBar/index.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock } from 'lucide-react';
import './styles.css';

const SearchBar = ({
  value,
  onChange,
  onSearch,
  placeholder = "搜索...",
  showHistory = true,
  maxHistory = 5
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('searchHistory');
      // 确保历史记录是一个有效的数组
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error loading search history:', error);
      return [];
    }
  });
  
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // 监听输入值变化
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // 监听点击外部事件
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 处理输入变化,实时搜索
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onSearch?.(newValue.trim().toLowerCase());
  };

  // 更新历史记录
  const updateSearchHistory = useCallback((searchTerm) => {
    const normalizedTerm = searchTerm.trim();
    if (!normalizedTerm) return;

    try {
      // 移除旧的相同搜索词(不区分大小写)
      const filteredHistory = searchHistory.filter(
        term => term.toLowerCase() !== normalizedTerm.toLowerCase()
      );
      
      // 将新搜索词添加到开头
      const newHistory = [normalizedTerm, ...filteredHistory].slice(0, maxHistory);
      
      // 更新状态和本地存储
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error updating search history:', error);
    }
  }, [searchHistory, maxHistory]);

  // 执行搜索
  const executeSearch = useCallback((searchTerm) => {
    const normalizedTerm = searchTerm.trim();
    if (normalizedTerm) {
      onChange(normalizedTerm);
      updateSearchHistory(normalizedTerm);
    }
  }, [onChange, updateSearchHistory]);

  // 处理回车按键
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      executeSearch(inputValue);
      setIsFocused(false);
    }
  };

  // 处理搜索按钮点击
  const handleSearchClick = () => {
    if (inputValue.trim()) {
      executeSearch(inputValue);
      setIsFocused(false);
    }
  };

  // 清除搜索
  const clearSearch = useCallback(() => {
    setInputValue('');
    onChange('');
    onSearch?.('');
    inputRef.current?.focus();
  }, [onChange, onSearch]);

  // 清除历史记录
  const clearHistory = useCallback((e) => {
    e.stopPropagation();
    setSearchHistory([]);
    try {
      localStorage.removeItem('searchHistory');
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }, []);

  // 使用历史记录项
  const handleHistoryItemClick = useCallback((term) => {
    setInputValue(term);
    executeSearch(term);
    setIsFocused(false);
  }, [executeSearch]);

  return (
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
  );
};

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func,
  placeholder: PropTypes.string,
  showHistory: PropTypes.bool,
  maxHistory: PropTypes.number
};

export default React.memo(SearchBar);