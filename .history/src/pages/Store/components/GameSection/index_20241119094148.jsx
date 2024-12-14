// src/pages/store/index.jsx
import React, { useState, useMemo } from 'react';
import FilterSection from './components/FilterSection';
import GameSection from './components/GameSection';
import { MOCK_GAMES, PRICE_RANGES } from './constants';
import { PAGINATION_CONFIG } from './constants';
import './styles.css';

const StorePage = () => {
  // 状态管理
  const [filters, setFilters] = useState({
    priceRange: '',
    genres: [],
    tags: []
  });
  const [currentPage, setCurrentPage] = useState(1);

  // 使用 useMemo 缓存过滤后的游戏列表
  const filteredGames = useMemo(() => {
    return MOCK_GAMES.filter(game => {
      // 价格过滤
      if (filters.priceRange) {
        const range = PRICE_RANGES.find(r => r.id === filters.priceRange);
        if (range) {
          const price = game.price;
          if (range.max === null) {
            if (price < range.min) return false;
          } else if (price < range.min || price > range.max) {
            return false;
          }
        }
      }

      // 游戏类型过滤
      if (filters.genres.length > 0) {
        if (!game.tags.some(tag => 
          filters.genres.includes(tag.toLowerCase())
        )) {
          return false;
        }
      }

      // 特殊标签过滤
      if (filters.tags.length > 0) {
        if (!filters.tags.every(tag => 
          game.features.map(f => f.toLowerCase()).includes(tag.toLowerCase())
        )) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  // 处理过滤器变化
  const handleFilterChange = (type, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [type]: value
    }));
    // 重置页码到第一页
    setCurrentPage(1);
  };

  return (
    <div className="store-container">
      <aside className="store-sidebar">
        <FilterSection 
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </aside>
      <main className="store-main">
        <GameSection 
          games={filteredGames}
          currentPage={currentPage}
          itemsPerPage={PAGINATION_CONFIG.defaultItemsPerPage}
        />
      </main>
    </div>
  );
};

export default StorePage;