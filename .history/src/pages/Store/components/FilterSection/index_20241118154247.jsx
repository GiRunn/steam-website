import React from 'react';
import { motion } from 'framer-motion';
import { 
  PRICE_RANGES,
  GAME_GENRES,
  SPECIAL_TAGS
} from '../../constants';
import './styles.css';

const FilterSection = ({ filters, onFilterChange }) => {
  const handlePriceChange = (priceRange) => {
    onFilterChange('priceRange', priceRange);
  };

  const handleGenreChange = (genre) => {
    const newGenres = filters.genres.includes(genre)
      ? filters.genres.filter(g => g !== genre)
      : [...filters.genres, genre];
    onFilterChange('genres', newGenres);
  };

  const handleTagChange = (tag) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onFilterChange('tags', newTags);
  };

  return (
    <div className="filter-section">
      {/* 价格区间 */}
      <div className="filter-group">
        <h3 className="filter-title">价格区间</h3>
        <div className="price-ranges">
          {PRICE_RANGES.map((range) => (
            <label 
              key={range.id}
              className="price-range-item group"
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
                    initial={false}
                    animate={{ 
                      scale: filters.priceRange === range.id ? 1 : 0 
                    }}
                    className="checkbox-inner"
                  />
                </div>
                <span className="range-label">{range.label}</span>
              </div>
              <span className="range-count">{range.count}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 游戏类型 */}
      <div className="filter-group">
        <h3 className="filter-title">游戏类型</h3>
        <div className="genre-list">
          {GAME_GENRES.map((genre) => (
            <label 
              key={genre.id}
              className="genre-item group"
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
                    initial={false}
                    animate={{ 
                      scale: filters.genres.includes(genre.id) ? 1 : 0 
                    }}
                    className="checkbox-inner"
                  />
                </div>
                <span className="genre-label">{genre.label}</span>
              </div>
              <span className="genre-count">{genre.count}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 特殊标签 */}
      <div className="filter-group">
        <h3 className="filter-title">特殊标签</h3>
        <div className="tags-grid">
          {SPECIAL_TAGS.map((tag) => (
            <button
              key={tag.id}
              className={`tag-btn ${
                filters.tags.includes(tag.id) ? 'active' : ''
              }`}
              onClick={() => handleTagChange(tag.id)}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSection;