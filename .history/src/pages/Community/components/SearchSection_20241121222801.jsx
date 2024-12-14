// src/pages/Community/components/SearchSection.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { POST_TYPES } from '../constants';
import { Tooltip } from '../../../components/ui/Tooltip';

const SearchSection = ({ searchTerm, setSearchTerm, currentCategory, setCurrentCategory }) => {
  return (
    <div className="mb-10 flex flex-col gap-6">
      {/* 搜索栏 */}
      <div className="relative">
        <input
          type="text"
          placeholder="搜索内容..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-12 pl-12 pr-4 bg-gradient-to-r from-[#0f1724] to-[#141d2e] border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors duration-300"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {/* 分类标签 */}
      <div className="flex items-center justify-center gap- overflow-x-auto pb-8 scrollbar-hide">
        {POST_TYPES.map((type) => (
          <Tooltip key={type.id} content={`查看${type.name}帖子`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentCategory(type.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300
                ${currentCategory === type.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}
            >
              <type.icon className={`w-5 h-5 ${
                currentCategory === type.id ? 'text-white' : `text-${type.color}-400`
              }`} />
              <span>{type.name}</span>
              {currentCategory === type.id && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-2 h-2 rounded-full bg-white"
                />
              )}
            </motion.button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default SearchSection;