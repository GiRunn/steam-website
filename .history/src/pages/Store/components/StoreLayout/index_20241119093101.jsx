import React, { useState, useCallback, useMemo } from 'react';
import FilterSection from '../FilterSection';
import { MOCK_GAMES } from '../../constants';

const StoreLayout = () => {
  // 初始化过滤器状态
  const [filters, setFilters] = useState({
    priceRange: '',
    genres: [],
    tags: []
  });

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

      // 类型过滤
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
          game.features.some(f => f.toLowerCase().includes(tag))
        )) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  // 处理过滤器变化的回调函数
  const handleFilterChange = useCallback((type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
  }, []);

  return (
    <div className="store-layout">
      <div className="store-sidebar">
        <FilterSection 
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>
      <div className="store-content">
        {/* 这里可以添加游戏列表组件 */}
        <div>已过滤：{filteredGames.length} 个游戏</div>
      </div>
    </div>
  );
};

export default StoreLayout;