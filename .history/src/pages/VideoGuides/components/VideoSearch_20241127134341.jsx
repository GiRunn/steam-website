// E:\Steam\steam-website\src\pages\VideoGuides\components\VideoSearch.jsx
// 用途：视频搜索和筛选组件

import React from 'react';
import { Search, Grid, List, SortAsc } from 'lucide-react';
import { SORT_OPTIONS, VIEW_MODES } from '../constants';

const VideoSearch = ({
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy
}) => {
  return (
    <div className="flex flex-wrap gap-6 mb-8">
      {/* 搜索框 */}
      <div className="flex-1">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索视频..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-[#253447] border border-white/10 rounded-xl 
              text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* 视图切换 */}
      <div className="flex items-center gap-2 bg-[#253447] rounded-xl p-1">
        <button
          onClick={() => setViewMode(VIEW_MODES.GRID)}
          className={`p-2 rounded-lg transition-colors ${
            viewMode === VIEW_MODES.GRID
              ? 'bg-blue-500 text-white'
              : 'text-gray-400 hover:bg-white/5'
          }`}
        >
          <Grid className="w-5 h-5" />
        </button>
        <button
          onClick={() => setViewMode(VIEW_MODES.LIST)}
          className={`p-2 rounded-lg transition-colors ${
            viewMode === VIEW_MODES.LIST
              ? 'bg-blue-500 text-white'
              : 'text-gray-400 hover:bg-white/5'
          }`}
        >
          <List className="w-5 h-5" />
        </button>
      </div>

      {/* 排序 */}
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="h-12 pl-4 pr-10 bg-[#253447] border border-white/10 rounded-xl
            text-white appearance-none focus:outline-none focus:border-blue-500 transition-colors"
        >
          {SORT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <SortAsc className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
};

export default VideoSearch;