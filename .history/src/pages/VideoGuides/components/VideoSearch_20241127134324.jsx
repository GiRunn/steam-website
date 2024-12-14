import React, { useState } from 'react';
import { Search, Grid, List, SortAsc, X } from 'lucide-react';
import { SORT_OPTIONS, VIEW_MODES } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

// 搜索输入框组件
const SearchInput = ({ searchTerm, setSearchTerm }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div 
      className="relative flex-1"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={`absolute inset-0 bg-blue-500/20 rounded-xl blur-xl transition-opacity duration-300
          ${isFocused ? 'opacity-100' : 'opacity-0'}`}
        animate={{ scale: isFocused ? 1.02 : 1 }}
        transition={{ duration: 0.2 }}
      />
      <div className="relative">
        <input
          type="text"
          placeholder="搜索视频..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full h-14 pl-14 pr-12 bg-[#253447] border-2 border-[#2a3a4f] rounded-xl
            text-white placeholder-gray-400 focus:outline-none focus:border-blue-500
            transition-all duration-300 hover:border-[#3a4a6f]"
        />
        <motion.div
          className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Search className="w-6 h-6 text-blue-400" />
        </motion.div>
        <AnimatePresence>
          {searchTerm && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full
                hover:bg-[#2a3a4f] transition-colors duration-300"
            >
              <X className="w-5 h-5 text-blue-400" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// 视图切换组件
const ViewToggle = ({ viewMode, setViewMode }) => {
  return (
    <motion.div
      className="flex items-center bg-[#253447] rounded-xl p-1.5 border-2 border-[#2a3a4f]"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {Object.values(VIEW_MODES).map((mode) => (
        <motion.button
          key={mode}
          onClick={() => setViewMode(mode)}
          className={`relative p-3 rounded-lg ${
            viewMode === mode ? 'text-white' : 'text-gray-400'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {viewMode === mode && (
            <motion.div
              layoutId="viewModeBg"
              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
          <motion.div
            animate={{ 
              rotate: viewMode === mode ? 360 : 0,
              scale: viewMode === mode ? 1.1 : 1
            }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            {mode === VIEW_MODES.GRID ? (
              <Grid className="w-5 h-5" />
            ) : (
              <List className="w-5 h-5" />
            )}
          </motion.div>
        </motion.button>
      ))}
    </motion.div>
  );
};

// 排序选择组件
const SortSelect = ({ sortBy, setSortBy }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      className="relative"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 px-5 bg-[#253447] border-2 border-[#2a3a4f] rounded-xl
          text-white flex items-center gap-3 min-w-[180px] hover:border-blue-500
          transition-all duration-300 relative overflow-hidden"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.span 
          className="flex-1 text-left text-blue-400"
          animate={{ y: isOpen ? -20 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {SORT_OPTIONS.find(opt => opt.value === sortBy)?.label}
        </motion.span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <SortAsc className="w-5 h-5 text-blue-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute top-full left-0 w-full mt-2 bg-[#253447] border-2 border-[#2a3a4f]
              rounded-xl overflow-hidden z-50 shadow-lg shadow-black/50"
          >
            {SORT_OPTIONS.map((option, index) => (
              <motion.button
                key={option.value}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  setSortBy(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-5 py-3 text-left transition-all duration-200
                  ${sortBy === option.value 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-[#2a3a4f] hover:text-blue-400'
                  }`}
                whileHover={{ x: 5 }}
              >
                {option.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
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
    <motion.div 
      className="relative p-6 mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="absolute inset-0 bg-[#0a0f16] rounded-2xl opacity-50"
        animate={{ 
          scale: [1, 1.02, 1],
          opacity: [0.5, 0.6, 0.5]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <div className="relative flex flex-wrap gap-4">
        <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <div className="flex gap-4 flex-wrap sm:flex-nowrap">
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
          <SortSelect sortBy={sortBy} setSortBy={setSortBy} />
        </div>
      </div>
    </motion.div>
  );
};

export default VideoSearch;