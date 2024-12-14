// E:\Steam\steam-website\src\pages\VideoGuides\components\VideoSearch.jsx
// 用途：视频搜索和筛选组件 - 优化版本，更简洁的设计

import React from 'react';
import { Search, Grid, List, SortAsc } from 'lucide-react';
import { SORT_OPTIONS, VIEW_MODES } from '../constants';

// 搜索输入框子组件
const SearchInput = ({ searchTerm, setSearchTerm }) => (
  <div className="flex-1 relative group">
    <input
      type="text"
      placeholder="搜索视频..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full h-11 pl-11 pr-4 bg-[#1a2332]/80 rounded-xl 
        text-white placeholder-gray-400 focus:outline-none
        border border-white/10 focus:border-blue-500
        transition-all duration-200 ease-in-out
        hover:border-white/20"
    />
    <Search 
      className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 
        text-gray-400 group-hover:text-gray-300 transition-colors" 
    />
  </div>
);

// 视图切换按钮子组件
const ViewModeToggle = ({ viewMode, setViewMode }) => (
  <div className="flex items-center bg-[#1a2332]/80 rounded-xl border border-white/10">
    {[
      { mode: VIEW_MODES.GRID, icon: Grid },
      { mode: VIEW_MODES.LIST, icon: List }
    ].map(({ mode, icon: Icon }) => (
      <button
        key={mode}
        onClick={() => setViewMode(mode)}
        className={`
          p-2.5 rounded-lg transition-all duration-200
          ${viewMode === mode 
            ? 'bg-blue-500/90 text-white shadow-sm' 
            : 'text-gray-400 hover:bg-white/5 hover:text-gray-300'
          }
        `}
      >
        <Icon className="w-5 h-5" />
      </button>
    ))}
  </div>
);

// 排序选择子组件
const SortSelect = ({ sortBy, setSortBy }) => (
  <div className="relative group">
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      className="h-11 pl-4 pr-10 bg-[#1a2332]/80 rounded-xl
        text-white appearance-none cursor-pointer
        border border-white/10 hover:border-white/20
        focus:outline-none focus:border-blue-500
        transition-all duration-200 ease-in-out"
    >
      {SORT_OPTIONS.map(option => (
        <option 
          key={option.value} 
          value={option.value}
          className="bg-[#1a2332]"
        >
          {option.label}
        </option>
      ))}
    </select>
    <SortAsc 
      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 
        text-gray-400 pointer-events-none group-hover:text-gray-300
        transition-colors" 
    />
  </div>
);

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
    <div className="flex flex-wrap items-center gap-4 mb-8">
      <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
      <SortSelect sortBy={sortBy} setSortBy={setSortBy} />
    </div>
  );
};

export default VideoSearch;