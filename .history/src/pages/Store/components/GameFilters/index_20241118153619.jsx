// src/pages/Store/components/GameFilters/index.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HashIcon, Tag, Star, DollarSign, GamepadIcon } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import FilterSection from './FilterSection';
import PriceRange from './PriceRange';
import TagCloud from './TagCloud';

const GameFilters = ({ onFilterChange }) => {
  // 过滤器状态
  const [filters, setFilters] = useState({
    priceRange: [0, 500],
    categories: [],
    tags: [],
    features: []
  });

  // 分类数据
  const categories = [
    { id: 'action', label: '动作', count: 1524 },
    { id: 'adventure', label: '冒险', count: 982 },
    { id: 'rpg', label: 'RPG', count: 756 },
    { id: 'strategy', label: '策略', count: 445 },
    { id: 'simulation', label: '模拟', count: 678 },
    { id: 'sports', label: '体育', count: 234 },
    { id: 'racing', label: '竞速', count: 189 },
    { id: 'puzzle', label: '解谜', count: 567 }
  ];

  // 特性数据
  const features = [
    { id: 'singleplayer', label: '单人' },
    { id: 'multiplayer', label: '多人' },
    { id: 'coop', label: '合作' },
    { id: 'vrsupport', label: 'VR支持' },
    { id: 'controller', label: '手柄支持' },
    { id: 'achievements', label: '成就系统' },
    { id: 'cloud', label: '云存档' },
    { id: 'workshop', label: '创意工坊' }
  ];

  // 标签数据
  const popularTags = [
    { id: 'open-world', label: '开放世界', weight: 156 },
    { id: 'story-rich', label: '剧情丰富', weight: 134 },
    { id: 'atmospheric', label: '氛围', weight: 98 },
    { id: 'difficult', label: '高难度', weight: 87 },
    { id: 'pixel', label: '像素', weight: 76 },
    { id: 'fps', label: '第一人称射击', weight: 65 }
  ];

  // 处理过滤器变化
  const handleFilterChange = (type, value) => {
    const newFilters = {
      ...filters,
      [type]: value
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="w-80 flex-shrink-0 space-y-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="sticky top-24 space-y-6"
      >
        {/* 价格区间筛选 */}
        <div className="bg-[#1a1f2e] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">价格区间</h3>
          </div>
          <PriceRange
            value={filters.priceRange}
            onChange={(value) => handleFilterChange('priceRange', value)}
            min={0}
            max={500}
          />
        </div>

        {/* 游戏分类筛选 */}
        <FilterSection
          title="游戏分类"
          icon={GamepadIcon}
          items={categories}
          selected={filters.categories}
          onChange={(value) => handleFilterChange('categories', value)}
          showCount
        />

        {/* 特性筛选 */}
        <FilterSection
          title="游戏特性"
          icon={Star}
          items={features}
          selected={filters.features}
          onChange={(value) => handleFilterChange('features', value)}
        />

        {/* 标签云 */}
        <div className="bg-[#1a1f2e] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">热门标签</h3>
          </div>
          <TagCloud
            tags={popularTags}
            selected={filters.tags}
            onChange={(value) => handleFilterChange('tags', value)}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default GameFilters;