// E:\Steam\steam-website\src\pages\VideoGuides\components\VideoCategories.jsx
// 用途：视频分类导航组件，展示所有视频分类并处理分类切换，包含动画和视觉效果

import React from 'react';
import { motion } from 'framer-motion';
import { VIDEO_CATEGORIES } from '../constants';

// 容器动画配置
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

// 按钮动画配置
const buttonVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3 }
  }
};

const VideoCategories = ({ currentCategory, setCurrentCategory }) => {
  return (
    <motion.div 
      className="relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 左侧渐变遮罩 */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#1b2838] to-transparent z-10" />
      
      {/* 右侧渐变遮罩 */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#1b2838] to-transparent z-10" />

      {/* 分类按钮容器 */}
      <div className="flex items-center gap-4 overflow-x-auto pb-4 mb-8 scrollbar-hide 
        mask-linear-gradient px-2">
        {/* 全部分类按钮 */}
        <motion.button
          variants={buttonVariants}
          whileHover={{ 
            scale: 1.05,
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentCategory('all')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300
            backdrop-blur-sm border
            ${currentCategory === 'all'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400/30 shadow-lg shadow-blue-500/20'
              : 'bg-white/5 hover:bg-white/10 text-gray-400 border-white/5 hover:border-blue-500/30'
            }
          `}
        >
          <span className="font-medium">全部</span>
          
          {/* 选中状态的装饰性光晕 */}
          {currentCategory === 'all' && (
            <motion.div
              className="absolute inset-0 -z-10 bg-blue-500/20 rounded-xl blur-xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            />
          )}
        </motion.button>

        {/* 分类按钮列表 */}
        {VIDEO_CATEGORIES.map((category) => (
          <motion.button
            key={category.id}
            variants={buttonVariants}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentCategory(category.id)}
            className={`relative flex items-center gap-3 px-6 py-2.5 rounded-xl transition-all duration-300
              backdrop-blur-sm border group
              ${currentCategory === category.id
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-400/30 shadow-lg shadow-blue-500/20'
                : 'bg-white/5 hover:bg-white/10 text-gray-400 border-white/5 hover:border-blue-500/30'
              }
            `}
          >
            {/* 图标 */}
            <category.icon className={`w-5 h-5 transition-transform duration-300
              group-hover:scale-110 group-hover:text-blue-400
              ${currentCategory === category.id ? 'text-white' : 'text-gray-400'}
            `} />
            
            {/* 分类名称 */}
            <span className="font-medium whitespace-nowrap">{category.name}</span>

            {/* 选中状态的装饰性光晕 */}
            {currentCategory === category.id && (
              <motion.div
                className="absolute inset-0 -z-10 bg-blue-500/20 rounded-xl blur-xl"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default VideoCategories;