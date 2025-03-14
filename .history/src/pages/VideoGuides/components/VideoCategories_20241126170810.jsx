import React from 'react';
import { motion } from 'framer-motion';

const VideoCategories = ({ categories, currentCategory, setCurrentCategory }) => {
  return (
    <div className="flex items-center gap-4 overflow-x-auto pb-4 mb-8 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setCurrentCategory('all')}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
          currentCategory === 'all'
            ? 'bg-blue-500 text-white'
            : 'bg-[#1a1f2e] hover:bg-white/10 text-gray-400'
        }`}
      >
        <span>全部</span>
      </motion.button>

      {categories.map((category) => (
        <motion.button
          key={category.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentCategory(category.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            currentCategory === category.id
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
              : 'bg-[#1a1f2e] hover:bg-white/10 text-gray-400'
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