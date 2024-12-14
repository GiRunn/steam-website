// src/components/SearchBar/index.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import './styles.css';

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = "搜索游戏...",
  showHistory = true,
  maxHistory = 5 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const inputRef = useRef(null);
  const historyRef = useRef(null);

  // 处理搜索历史
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (historyRef.current && !historyRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 更新搜索历史
  const updateSearchHistory = useCallback((searchTerm) => {
    if (!showHistory || !searchTerm.trim()) return;
    
    setSearchHistory(prev => {
      const newHistory = [
        searchTerm,
        ...prev.filter(term => term !== searchTerm)
      ].slice(0, maxHistory);
      
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  }, [maxHistory, showHistory]);

  // 处理搜索输入
  const handleSearch = useCallback((e) => {
    const newValue = e.target.value;
    onChange(newValue);
    if (!newValue) updateSearchHistory(newValue);
  }, [onChange, updateSearchHistory]);

  // 清除搜索
  const clearSearch = useCallback(() => {
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  // 选择历史记录
  const selectHistory = useCallback((term) => {
    onChange(term);
    setIsFocused(false);
  }, [onChange]);

  // 清除历史记录
  const clearHistory = useCallback((e) => {
    e.stopPropagation();
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  }, []);

  return (
    <div className="search-bar-container" ref={historyRef}>
      <motion.div 
        className="search-input-wrapper"
        animate={{ 
          boxShadow: isFocused 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
            : 'none' 
        }}
      >
        <Search 
          className="search-icon" 
          size={20} 
        />
        <input
          ref={inputRef}
          type="search"
          className="search-input"
          value={value}
          onChange={handleSearch}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
        />
        <AnimatePresence>
          {value && (
            <motion.button
              className="clear-button"
              onClick={clearSearch}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={16} />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {isFocused && showHistory && searchHistory.length > 0 && (
          <motion.div
            className="search-history"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="history-header">
              <span className="history-title">搜索历史</span>
              <button 
                className="clear-history-button"
                onClick={clearHistory}
              >
                清除历史
              </button>
            </div>
            {searchHistory.map((term, index) => (
              <motion.button
                key={`${term}-${index}`}
                className="history-item"
                onClick={() => selectHistory(term)}
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
              >
                <Search size={16} className="history-icon" />
                <span>{term}</span>
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
  placeholder: PropTypes.string,
  showHistory: PropTypes.bool,
  maxHistory: PropTypes.number
};

export default React.memo(SearchBar);