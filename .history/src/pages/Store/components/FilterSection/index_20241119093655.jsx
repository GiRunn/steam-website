// src/pages/store/components/FilterSection/index.jsx
import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PRICE_RANGES,
  GAME_GENRES,
  SPECIAL_TAGS
} from '../../constants';
import './styles.css';

// PriceRangeSection 组件
const PriceRangeSection = memo(({ selectedRange, onChange }) => (
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
          className="price-range-item"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="checkbox-wrapper">
            <input
              type="radio"
              name="priceRange"
              checked={selectedRange === range.id}
              onChange={() => onChange(range.id)}
              className="hidden"
            />
            <motion.div 
              className="custom-checkbox"
              animate={{
                backgroundColor: selectedRange === range.id ? '#3b82f6' : 'transparent',
                borderColor: selectedRange === range.id ? '#3b82f6' : '#2a3441'
              }}
            >
              <motion.div
                className="checkbox-inner"
                initial={false}
                animate={{ scale: selectedRange === range.id ? 1 : 0 }}
              />
            </motion.div>
            <span className="range-label">{range.label}</span>
          </div>
          <span className="range-count">{range.count}</span>
        </motion.label>
      ))}
    </div>
  </motion.div>
));

// GenreSection 组件
const GenreSection = memo(({ selectedGenres, onChange }) => (
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
          className="genre-item"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="checkbox-wrapper">
            <input
              type="checkbox"
              checked={selectedGenres.includes(genre.id)}
              onChange={() => onChange(genre.id)}
              className="hidden"
            />
            <motion.div 
              className="custom-checkbox"
              animate={{
                backgroundColor: selectedGenres.includes(genre.id) ? '#3b82f6' : 'transparent',
                borderColor: selectedGenres.includes(genre.id) ? '#3b82f6' : '#2a3441'
              }}
            >
              <motion.div
                className="checkbox-inner"
                initial={false}
                animate={{ scale: selectedGenres.includes(genre.id) ? 1 : 0 }}
              />
            </motion.div>
            <span className="genre-label">{genre.label}</span>
          </div>
          <span className="genre-count">{genre.count}</span>
        </motion.label>
      ))}
    </div>
  </motion.div>
));

// TagsSection 组件
const TagsSection = memo(({ selectedTags, onChange }) => (
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
          className={`tag-btn ${selectedTags.includes(tag.id) ? 'active' : ''}`}
          onClick={() => onChange(tag.id)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {tag.label}
        </motion.button>
      ))}
    </div>
  </motion.div>
));

// FilterSection 主组件
const FilterSection = ({ filters, onFilterChange }) => {
  const handlePriceChange = useCallback((priceRange) => {
    onFilterChange('priceRange', priceRange);
  }, [onFilterChange]);

  const handleGenreChange = useCallback((genre) => {
    onFilterChange('genres', 
      filters.genres.includes(genre)
        ? filters.genres.filter(g => g !== genre)
        : [...filters.genres, genre]
    );
  }, [filters.genres, onFilterChange]);

  const handleTagChange = useCallback((tag) => {
    onFilterChange('tags',
      filters.tags.includes(tag)
        ? filters.tags.filter(t => t !== tag)
        : [...filters.tags, tag]
    );
  }, [filters.tags, onFilterChange]);

  return (
    <motion.div 
      className="filter-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence>
        <PriceRangeSection 
          selectedRange={filters.priceRange}
          onChange={handlePriceChange}
        />
        <GenreSection 
          selectedGenres={filters.genres}
          onChange={handleGenreChange}
        />
        <TagsSection 
          selectedTags={filters.tags}
          onChange={handleTagChange}
        />
      </AnimatePresence>
    </motion.div>
  );
};

FilterSection.propTypes = {
  filters: PropTypes.shape({
    priceRange: PropTypes.string,
    genres: PropTypes.arrayOf(PropTypes.string),
    tags: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired
};

export default memo(FilterSection);