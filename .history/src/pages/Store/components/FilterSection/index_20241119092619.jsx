import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types'; // 需要添加 prop-types 依赖
import { 
  PRICE_RANGES,
  GAME_GENRES,
  SPECIAL_TAGS
} from '../../constants';
import './styles.css';

const FilterSection = ({ filters, onFilterChange }) => {
  // 添加防抖函数来优化性能
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // 使用防抖处理过滤器变化
  const debouncedFilterChange = React.useCallback(
    debounce((type, value) => {
      onFilterChange(type, value);
    }, 300),
    [onFilterChange]
  );

  const handlePriceChange = React.useCallback((priceRange) => {
    debouncedFilterChange('priceRange', priceRange);
  }, [debouncedFilterChange]);

  const handleGenreChange = React.useCallback((genre) => {
    const newGenres = filters.genres.includes(genre)
      ? filters.genres.filter(g => g !== genre)
      : [...filters.genres, genre];
    debouncedFilterChange('genres', newGenres);
  }, [filters.genres, debouncedFilterChange]);

  const handleTagChange = React.useCallback((tag) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    debouncedFilterChange('tags', newTags);
  }, [filters.tags, debouncedFilterChange]);

  // 添加动画配置
  const checkboxAnimationVariants = {
    checked: { scale: 1 },
    unchecked: { scale: 0 }
  };

  return (
    <motion.div 
      className="filter-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* 价格区间 */}
      <motion.div 
        className="filter-group"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="filter-title">价格区间</h3>
        <div className="price-ranges">
          {PRICE_RANGES.map((range) => (
            <motion.label 
              key={range.id}
              className="price-range-item group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="checkbox-wrapper">
                <input
                  type="radio"
                  name="priceRange"
                  checked={filters.priceRange === range.id}
                  onChange={() => handlePriceChange(range.id)}
                  className="hidden"
                />
                <div className="custom-checkbox">
                  <motion.div
                    initial="unchecked"
                    animate={filters.priceRange === range.id ? "checked" : "unchecked"}
                    variants={checkboxAnimationVariants}
                    className="checkbox-inner"
                  />
                </div>
                <span className="range-label">{range.label}</span>
              </div>
              <span className="range-count">{range.count}</span>
            </motion.label>
          ))}
        </div>
      </motion.div>

      {/* 游戏类型 */}
      <motion.div 
        className="filter-group"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="filter-title">游戏类型</h3>
        <div className="genre-list">
          {GAME_GENRES.map((genre) => (
            <motion.label 
              key={genre.id}
              className="genre-item group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="checkbox-wrapper">
                <input
                  type="checkbox"
                  checked={filters.genres.includes(genre.id)}
                  onChange={() => handleGenreChange(genre.id)}
                  className="hidden"
                />
                <div className="custom-checkbox">
                  <motion.div
                    initial="unchecked"
                    animate={filters.genres.includes(genre.id) ? "checked" : "unchecked"}
                    variants={checkboxAnimationVariants}
                    className="checkbox-inner"
                  />
                </div>
                <span className="genre-label">{genre.label}</span>
              </div>
              <span className="genre-count">{genre.count}</span>
            </motion.label>
          ))}
        </div>
      </motion.div>

      {/* 特殊标签 */}
      <motion.div 
        className="filter-group"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="filter-title">特殊标签</h3>
        <div className="tags-grid">
          {SPECIAL_TAGS.map((tag) => (
            <motion.button
              key={tag.id}
              className={`tag-btn ${filters.tags.includes(tag.id) ? 'active' : ''}`}
              onClick={() => handleTagChange(tag.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tag.label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// 添加 PropTypes 验证
FilterSection.propTypes = {
  filters: PropTypes.shape({
    priceRange: PropTypes.string,
    genres: PropTypes.arrayOf(PropTypes.string),
    tags: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
};

export default React.memo(FilterSection);