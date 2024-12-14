// E:\Steam\steam-website\src\pages\VideoGuides\components\VideoCategories.jsx
// 用途：视频分类导航组件，展示所有视频分类并处理分类切换

import React from 'react';
import { motion } from 'framer-motion';
import { VIDEO_CATEGORIES } from '../constants';

const VideoCategories = ({ currentCategory, setCurrentCategory }) => {
  return (
    <div className="flex items-center gap-4 overflow-x-auto pb-4 mb-8 scrollbar-hide">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setCurrentCategory('all')}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
          currentCategory === 'all'
            ? 'bg-blue-500 text-white'
            : 'bg-white/5 hover:bg-white/10 text-gray-400'
        }`}
      >
        <span>全部</span>
      </motion.button>

      {VIDEO_CATEGORIES.map((category) => (
        <motion.button
          key={category.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentCategory(category.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            currentCategory === category.id
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
              : 'bg-white/5 hover:bg-white/10 text-gray-400'
          }`}
        >
          <category.icon className="w-5 h-5" />
          <span>{category.name}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default VideoCategories;