// E:\Steam\steam-website\src\pages\VideoGuides\components\VideoSearch.jsx
// 用途：视频搜索和筛选组件 - 包含搜索框、视图切换和排序功能

import React, { useState } from 'react';
import { Search, Grid, List, SortAsc } from 'lucide-react';
import { SORT_OPTIONS, VIEW_MODES } from '../constants';

// 搜索输入框子组件
const SearchInput = ({ searchTerm, setSearchTerm }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex-1 relative group">
      <div className={`
        absolute inset-0 bg-blue-500/20 rounded-xl blur-xl transition-opacity duration-300
        ${isFocused ? 'opacity-100' : 'opacity-0'}
      `} />
      <div className="relative">
        <input
          type="text"
          placeholder="搜索视频..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full h-12 pl-12 pr-4 bg-[#1a2332] border border-white/10 rounded-xl 
            text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 
            transition-all duration-300 hover:bg-[#1e2738]"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 
          group-hover:text-gray-300 transition-colors" />
      </div>
    </div>
  );
};

// 视图切换按钮子组件
const ViewModeToggle = ({ viewMode, setViewMode }) => {
  return (
    <div className="flex items-center gap-2 bg-[#1a2332] rounded-xl p-1 border border-white/10">
      {Object.values(VIEW_MODES).map((mode) => {
        const Icon = mode === VIEW_MODES.GRID ? Grid : List;
        const isActive = viewMode === mode;
        
        return (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`
              p-2 rounded-lg transition-all duration-300 transform
              ${isActive 
                ? 'bg-blue-500 text-white shadow-lg scale-105' 
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-300'
              }
            `}
          >
            <Icon className={`w-5 h-5 transition-transform duration-300 ${
              isActive ? 'scale-110' : ''
            }`} />
          </button>
        );
      })}
    </div>
  );
};

// 排序选择子组件
const SortSelect = ({ sortBy, setSortBy }) => {
  return (
    <div className="relative group">
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="h-12 pl-4 pr-10 bg-[#1a2332] border border-white/10 rounded-xl
          text-white appearance-none focus:outline-none focus:border-blue-500 
          transition-all duration-300 hover:bg-[#1e2738]
          cursor-pointer"
      >
        {SORT_OPTIONS.map(option => (
          <option 
            key={option.value} 
            value={option.value}
            className="bg-[#1a2332] text-white"
          >
            {option.label}
          </option>
        ))}
      </select>
      <SortAsc className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 
        text-gray-400 pointer-events-none group-hover:text-gray-300 
        transition-colors" />
    </div>
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
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl blur-3xl" />
      
      {/* 主内容 */}
      <div className="relative flex flex-wrap gap-6 mb-8 p-6 bg-[#0a0f16]/80 
        backdrop-blur-sm rounded-2xl border border-white/5 shadow-xl">
        <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
        <SortSelect sortBy={sortBy} setSortBy={setSortBy} />
      </div>
    </div>
  );
};

export default VideoSearch;