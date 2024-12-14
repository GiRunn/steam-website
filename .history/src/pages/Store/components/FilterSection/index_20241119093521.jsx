// src/pages/store/components/FilterSection/index.jsx
import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence } from 'framer-motion';
import * as S from './styles';
import { 
  PRICE_RANGES,
  GAME_GENRES,
  SPECIAL_TAGS
} from '../../constants';

// PriceRangeSection 组件
const PriceRangeSection = memo(({ selectedRange, onChange }) => (
  <S.FilterGroup
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.1 }}
  >
    <S.FilterTitle>价格区间</S.FilterTitle>
    <S.FilterList>
      {PRICE_RANGES.map((range) => (
        <S.FilterItem 
          key={range.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <S.CheckboxWrapper>
            <S.HiddenInput
              type="radio"
              name="priceRange"
              checked={selectedRange === range.id}
              onChange={() => onChange(range.id)}
            />
            <S.CustomCheckbox checked={selectedRange === range.id}>
              <S.CheckboxInner
                initial={false}
                animate={{ scale: selectedRange === range.id ? 1 : 0 }}
              />
            </S.CustomCheckbox>
            <S.Label>{range.label}</S.Label>
          </S.CheckboxWrapper>
          <S.Count>{range.count}</S.Count>
        </S.FilterItem>
      ))}
    </S.FilterList>
  </S.FilterGroup>
));

// GenreSection 组件
const GenreSection = memo(({ selectedGenres, onChange }) => (
  <S.FilterGroup
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.2 }}
  >
    <S.FilterTitle>游戏类型</S.FilterTitle>
    <S.FilterList>
      {GAME_GENRES.map((genre) => (
        <S.FilterItem 
          key={genre.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <S.CheckboxWrapper>
            <S.HiddenInput
              type="checkbox"
              checked={selectedGenres.includes(genre.id)}
              onChange={() => onChange(genre.id)}
            />
            <S.CustomCheckbox checked={selectedGenres.includes(genre.id)}>
              <S.CheckboxInner
                initial={false}
                animate={{ scale: selectedGenres.includes(genre.id) ? 1 : 0 }}
              />
            </S.CustomCheckbox>
            <S.Label>{genre.label}</S.Label>
          </S.CheckboxWrapper>
          <S.Count>{genre.count}</S.Count>
        </S.FilterItem>
      ))}
    </S.FilterList>
  </S.FilterGroup>
));

// TagsSection 组件
const TagsSection = memo(({ selectedTags, onChange }) => (
  <S.FilterGroup
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.3 }}
  >
    <S.FilterTitle>特殊标签</S.FilterTitle>
    <S.TagsGrid>
      {SPECIAL_TAGS.map((tag) => (
        <S.TagButton
          key={tag.id}
          active={selectedTags.includes(tag.id)}
          onClick={() => onChange(tag.id)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {tag.label}
        </S.TagButton>
      ))}
    </S.TagsGrid>
  </S.FilterGroup>
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
    <S.FilterContainer>
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
    </S.FilterContainer>
  );
};

// PropTypes 验证
FilterSection.propTypes = {
  filters: PropTypes.shape({
    priceRange: PropTypes.string,
    genres: PropTypes.arrayOf(PropTypes.string),
    tags: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired
};

export default memo(FilterSection);