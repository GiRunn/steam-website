// src/pages/store/components/FilterSection/styles.js
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export const FilterContainer = styled(motion.div)`
  padding: 1.5rem;
  background: #0a0f16;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const FilterGroup = styled(motion.div)`
  margin-bottom: 2rem;
`;

export const FilterTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #1a2030;
`;

export const FilterList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const FilterItem = styled(motion.label)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  transition: background-color 0.2s;
  cursor: pointer;

  &:hover {
    background-color: #141b26;
  }
`;

export const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const HiddenInput = styled.input`
  display: none;
`;

export const CustomCheckbox = styled(motion.div)`
  width: 20px;
  height: 20px;
  border: 2px solid ${props => props.checked ? '#3b82f6' : '#2a3441'};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background-color: ${props => props.checked ? '#3b82f6' : 'transparent'};
`;

export const CheckboxInner = styled(motion.div)`
  width: 12px;
  height: 12px;
  background: #ffffff;
  border-radius: 2px;
`;

export const Label = styled.span`
  font-size: 0.938rem;
  color: #9ca3af;
`;

export const Count = styled.span`
  font-size: 0.813rem;
  color: #9ca3af;
  background: #141b26;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
`;

export const TagsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
`;

export const TagButton = styled(motion.button)`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.active ? '#3b82f6' : '#1a2030'};
  border-radius: 8px;
  font-size: 0.875rem;
  color: ${props => props.active ? '#ffffff' : '#9ca3af'};
  background: ${props => props.active ? '#3b82f6' : '#0a0f16'};
  transition: all 0.2s;
  cursor: pointer;
  text-align: center;

  &:hover {
    background-color: ${props => props.active ? '#3b82f6' : '#141b26'};
  }
`;

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