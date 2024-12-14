import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PRICE_RANGES,
  GAME_GENRES,
  SPECIAL_TAGS
} from '../../constants';
import { styled } from '@emotion/styled';

// 使用 emotion 进行样式优化
const FilterContainer = styled(motion.div)`
  padding: 1.5rem;
  background: #0a0f16;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

// 子组件：价格区间选择
const PriceRangeSection = memo(({ selectedRange, onChange }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.1 }}
    className="filter-group"
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
                backgroundColor: selectedRange === range.id ? '#3b82f6' : 'transparent'
              }}
            />
            <span className="range-label">{range.label}</span>
          </div>
          <span className="range-count">{range.count}</span>
        </motion.label>
      ))}
    </div>
  </motion.div>
));

// 子组件：游戏类型选择
const GenreSection = memo(({ selectedGenres, onChange }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.2 }}
    className="filter-group"
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
                backgroundColor: selectedGenres.includes(genre.id) ? '#3b82f6' : 'transparent'
              }}
            />
            <span className="genre-label">{genre.label}</span>
          </div>
          <span className="genre-count">{genre.count}</span>
        </motion.label>
      ))}
    </div>
  </motion.div>
));

// 子组件：特殊标签选择
const TagsSection = memo(({ selectedTags, onChange }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.3 }}
    className="filter-group"
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

// 主组件
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
    <FilterContainer>
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
    </FilterContainer>
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