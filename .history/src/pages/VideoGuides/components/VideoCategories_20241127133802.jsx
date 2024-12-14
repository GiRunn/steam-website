// E:\Steam\steam-website\src\pages\VideoGuides\components\VideoCategories.jsx
// 用途：视频分类导航组件，展示所有视频分类并处理分类切换

import React from 'react';
import { motion } from 'framer-motion';
import { VIDEO_CATEGORIES } from '../constants';

const VideoCategories = ({ currentCategory, setCurrentCategory }) => {
  return (
    <div className="relative mb-8">
      {/* 左右渐变遮罩 - 用于提示可滚动 */}
      <div className="absolute left-0 top-2 bottom-2 w-12 
        bg-gradient-to-r from-[#0a0f16] to-transparent z-10" />
      <div className="absolute right-0 top-2 bottom-2 w-12 
        bg-gradient-to-l from-[#0a0f16] to-transparent z-10" />

      {/* 分类列表容器 */}
      <div className="flex items-center gap-3 overflow-x-auto py-2 px-2 scrollbar-hide">
        {/* 全部分类按钮 */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentCategory('all')}
          className={`
            px-5 py-2 rounded-lg transition-all duration-200
            font-medium min-w-[90px] border
            ${currentCategory === 'all'
              ? 'bg-[#1a2433] text-blue-400 border-blue-500/30 shadow-sm shadow-blue-500/20'
              : 'bg-[#1a2433]/50 hover:bg-[#1a2433] text-gray-400 border-transparent'
            }
          `}
        >
          全部
        </motion.button>

        {/* 分类按钮列表 */}
        {VIDEO_CATEGORIES.map((category) => (
          <motion.button
            key={category.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentCategory(category.id)}
            className={`
              flex items-center gap-2 px-5 py-2 rounded-lg 
              transition-all duration-200 font-medium
              min-w-[90px] border backdrop-blur-sm
              ${currentCategory === category.id
                ? 'bg-[#1a2433] text-blue-400 border-blue-500/30 shadow-sm shadow-blue-500/20'
                : 'bg-[#1a2433]/50 hover:bg-[#1a2433] text-gray-400 border-transparent'
              }
            `}
          >
            {/* 图标 */}
            <category.icon 
              className={`w-4 h-4 transition-colors duration-200
                ${currentCategory === category.id ? 'text-blue-400' : 'text-gray-500'}
              `} 
            />
            
            {/* 分类名称 */}
            <span>{category.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default VideoCategories;