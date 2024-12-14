import React, { useState } from 'react';
import { Search, Grid, List, SortAsc, X } from 'lucide-react';
import { SORT_OPTIONS, VIEW_MODES } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

// 搜索输入框子组件
const SearchInput = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative flex-1 group">
      <input
        type="text"
        placeholder="搜索视频..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full h-12 pl-12 pr-12 bg-[#1a2535] border border-[#2a3a4f] rounded-xl
          text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50
          focus:border-blue-500 transition-all duration-300 hover:border-[#3a4a6f]"
      />
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 
        group-hover:text-gray-300 transition-colors duration-300" />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full
            hover:bg-[#2a3a4f] transition-colors duration-300"
        >
          <X className="w-4 h-4 text-gray-400 hover:text-white" />
        </button>
      )}
    </div>
  );
};

// 视图切换子组件
const ViewToggle = ({ viewMode, setViewMode }) => {
  return (
    <div className="flex items-center gap-1 bg-[#1a2535] rounded-xl p-1 border border-[#2a3a4f]">
      {Object.values(VIEW_MODES).map((mode) => (
        <button
          key={mode}
          onClick={() => setViewMode(mode)}
          className={`relative p-2.5 rounded-lg transition-all duration-300 ${
            viewMode === mode
              ? 'text-white'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#2a3a4f]'
          }`}
        >
          {viewMode === mode && (
            <motion.div
              layoutId="viewMode"
              className="absolute inset-0 bg-blue-500 rounded-lg"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          {mode === VIEW_MODES.GRID ? (
            <Grid className="w-5 h-5 relative z-10" />
          ) : (
            <List className="w-5 h-5 relative z-10" />
          )}
        </button>
      ))}
    </div>
  );
};

// 排序选择子组件
const SortSelect = ({ sortBy, setSortBy }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 px-4 bg-[#1a2535] border border-[#2a3a4f] rounded-xl
          text-white flex items-center gap-3 min-w-[160px] hover:border-[#3a4a6f]
          focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
      >
        <span className="flex-1 text-left">
          {SORT_OPTIONS.find(opt => opt.value === sortBy)?.label}
        </span>
        <SortAsc className="w-5 h-5 text-gray-400" />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 w-full mt-2 bg-[#1a2535] border border-[#2a3a4f]
              rounded-xl overflow-hidden shadow-lg z-50"
          >
            {SORT_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  setSortBy(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left transition-colors duration-200
                  ${sortBy === option.value 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-300 hover:bg-[#2a3a4f]'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
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
    <div className="flex flex-wrap gap-4 mb-8 p-4 bg-[#0a0f16]/50 rounded-2xl backdrop-blur-sm">
      <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className="flex gap-4 flex-wrap sm:flex-nowrap">
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        <SortSelect sortBy={sortBy} setSortBy={setSortBy} />
      </div>
    </div>
  );
};

export default VideoSearch;