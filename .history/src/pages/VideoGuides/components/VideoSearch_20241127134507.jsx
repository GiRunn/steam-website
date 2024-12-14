// E:\Steam\steam-website\src\pages\VideoGuides\components\VideoSearch.jsx
// 用途：视频搜索和筛选组件 - 增强版本，包含动画效果和更精致的设计

import React, { useState } from 'react';
import { Search, Grid, List, SortAsc } from 'lucide-react';
import { SORT_OPTIONS, VIEW_MODES } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

// 搜索输入框子组件
const SearchInput = ({ searchTerm, setSearchTerm }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div 
      className="flex-1 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`
        relative rounded-xl overflow-hidden
        ${isFocused ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
        transition-all duration-300 ease-in-out
      `}>
        <input
          type="text"
          placeholder="搜索视频..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full h-12 pl-12 pr-4 bg-[#253447] border border-white/10 
            text-white placeholder-gray-400 focus:outline-none
            transition-all duration-300"
        />
        <motion.div
          animate={{ scale: isFocused ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
          className="absolute left-4 top-1/2 -translate-y-1/2"
        >
          <Search className="w-5 h-5 text-gray-400" />
        </motion.div>
      </div>
    </motion.div>
  );
};

// 视图切换按钮子组件
const ViewModeToggle = ({ viewMode, setViewMode }) => {
  return (
    <motion.div 
      className="flex items-center gap-2 bg-[#253447] rounded-xl p-1"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {Object.values(VIEW_MODES).map((mode) => (
        <motion.button
          key={mode}
          onClick={() => setViewMode(mode)}
          className={`relative p-2 rounded-lg transition-all duration-300
            ${viewMode === mode ? 'text-white' : 'text-gray-400 hover:text-gray-300'}
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {mode === VIEW_MODES.GRID ? (
            <Grid className="w-5 h-5" />
          ) : (
            <List className="w-5 h-5" />
          )}
          {viewMode === mode && (
            <motion.div
              layoutId="activeView"
              className="absolute inset-0 bg-blue-500 rounded-lg -z-10"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </motion.button>
      ))}
    </motion.div>
  );
};

// 排序选择器子组件
const SortSelector = ({ sortBy, setSortBy }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div
        className={`
          relative h-12 bg-[#253447] border border-white/10 rounded-xl
          transition-all duration-300 ease-in-out
          ${isOpen ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
        `}
      >
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
          className="h-full w-full pl-4 pr-10 bg-transparent
            text-white appearance-none focus:outline-none cursor-pointer"
        >
          {SORT_OPTIONS.map(option => (
            <option 
              key={option.value} 
              value={option.value}
              className="bg-[#253447] text-white"
            >
              {option.label}
            </option>
          ))}
        </select>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute right-4 top-1/2 -translate-y-1/2"
        >
          <SortAsc className="w-5 h-5 text-gray-400 pointer-events-none" />
        </motion.div>
      </div>
    </motion.div>
  );
};

// 主组件
const VideoSearch = ({
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy
}) => {
  return (
    <div className="relative">
      {/* 背景光晕效果 */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl blur-xl" />
      
      {/* 主要内容 */}
      <motion.div 
        className="relative flex flex-wrap gap-6 mb-8 p-4 backdrop-blur-sm rounded-2xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
        <SortSelector sortBy={sortBy} setSortBy={setSortBy} />
      </motion.div>
    </div>
  );
};

export default VideoSearch;