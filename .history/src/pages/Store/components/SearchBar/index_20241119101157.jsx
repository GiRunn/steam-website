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
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = useCallback((searchTerm) => {
    onChange(searchTerm);
    if (searchTerm.trim() && !searchHistory.includes(searchTerm.trim())) {
      const newHistory = [searchTerm.trim(), ...searchHistory].slice(0, maxHistory);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
  }, [onChange, searchHistory, maxHistory]);

  const clearSearch = useCallback(() => {
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
        <Search className="search-icon" size={16} />
        <motion.input
          ref={inputRef}
          type="text"
          className="search-input"
          value={value}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          whileFocus={{ scale: 1.01 }}
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
                  handleSearch(term);
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