// src/components/SearchBar/index.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import './styles.css';

const SearchBar = ({
  value,
  onChange,
  placeholder = "搜索...",
  showHistory = true,
  maxHistory = 5
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(value); // 添加本地输入状态
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // 同步外部value和本地inputValue
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

  // 处理输入变化
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // 执行搜索并记录历史
  const executeSearch = useCallback((searchTerm) => {
    onChange(searchTerm.trim());
    if (searchTerm.trim() && !searchHistory.includes(searchTerm.trim())) {
      const newHistory = [searchTerm.trim(), ...searchHistory].slice(0, maxHistory);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
  }, [onChange, searchHistory, maxHistory]);

  // 处理回车键搜索
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      executeSearch(inputValue);
      setIsFocused(false);
    }
  };

  // 处理搜索按钮点击
  const handleSearchClick = () => {
    executeSearch(inputValue);
    setIsFocused(false);
  };

  const clearSearch = useCallback(() => {
    setInputValue('');
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  const clearHistory = useCallback((e) => {
    e.stopPropagation();
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  }, []);

  return (
    <div className="search-bar-container" ref={containerRef}>
      <div className="search-input-wrapper">
        <button 
          className="search-icon-button"
          onClick={handleSearchClick}
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
        />
        <AnimatePresence>
          {inputValue && (
            <motion.button
              className="clear-button"
              onClick={clearSearch}
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
          >
            <div className="history-header">
              <span className="history-title">搜索历史</span>
              <button className="clear-history" onClick={clearHistory}>
                清除
              </button>
            </div>
            {searchHistory.map((term, index) => (
              <button
                key={`${term}-${index}`}
                className="history-item"
                onClick={() => {
                  executeSearch(term);
                  setIsFocused(false);
                }}
              >
                <Search size={14} className="history-icon" />
                <span>{term}</span>
              </button>
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