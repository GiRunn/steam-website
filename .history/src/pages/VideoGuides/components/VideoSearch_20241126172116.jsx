import React from 'react';
import { Search, Grid, List, SortAsc } from 'lucide-react';

const VideoSearch = ({ searchTerm, setSearchTerm, viewMode, setViewMode, sortBy, setSortBy }) => {
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
            className="w-full h-12 pl-12 pr-4 bg-[#1a1f2e] border border-white/10 rounded-xl 
              text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* 视图切换 */}
      <div className="flex items-center gap-2 bg-[#1a1f2e] rounded-xl p-1">
        <button
          onClick={() => setViewMode('grid')}
          className={`p-2 rounded-lg transition-colors ${
            viewMode === 'grid'
              ? 'bg-blue-500 text-white'
              : 'text-gray-400 hover:bg-white/5'
          }`}
        >
          <Grid className="w-5 h-5" />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`p-2 rounded-lg transition-colors ${
            viewMode === 'list'
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
          className="h-12 pl-4 pr-10 bg-[#1a1f2e] border border-white/10 rounded-xl
            text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        >
          <option value="newest">最新发布</option>
          <option value="popular">最受欢迎</option>
          <option value="views">观看最多</option>
        </select>
        <SortAsc className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
};

export default VideoSearch;