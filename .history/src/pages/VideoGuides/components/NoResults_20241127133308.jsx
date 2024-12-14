// E:\Steam\steam-website\src\pages\VideoGuides\components\NoResults.jsx
// 用途：当搜索结果为空时显示的提示组件，包含动画效果和清空搜索条件功能

import React from 'react';
import { motion } from 'framer-motion';
import { Search, RotateCcw, Hash } from 'lucide-react';

// 动画配置
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

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

const NoResults = ({ onReset }) => {
  // 示例标签，实际使用时可以通过props传入
  const suggestedTags = ['热门游戏', '游戏攻略', '新发布', '多人游戏'];

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[400px] p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 搜索图标容器 */}
      <motion.div 
        className="relative mb-8"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* 背景光晕效果 */}
        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl scale-150" />
        
        {/* 图标背景 */}
        <div className="relative bg-gradient-to-br from-[#1e2837] to-[#0a0f16] 
          p-6 rounded-full border border-white/10 shadow-xl">
          <Search className="w-16 h-16 text-blue-400" />
        </div>

        {/* 装饰性圆圈动画 */}
        <motion.div
          className="absolute -inset-4 border-2 border-dashed border-blue-500/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {/* 文本内容 */}
      <motion.h3 
        variants={itemVariants}
        className="text-2xl font-semibold bg-gradient-to-r from-white to-white/90 
          bg-clip-text text-transparent mb-3"
      >
        未找到相关视频
      </motion.h3>

      <motion.p 
        variants={itemVariants}
        className="text-gray-400 text-lg mb-8"
      >
        试试其他关键词或浏览不同分类
      </motion.p>

      {/* 建议标签 */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-wrap justify-center gap-3 max-w-lg"
      >
        {suggestedTags.map((tag) => (
          <motion.button
            key={tag}
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-white/5 rounded-full text-gray-400 
              border border-white/10 backdrop-blur-sm flex items-center gap-2
              hover:border-blue-500/30 hover:text-blue-400 transition-colors duration-300"
          >
            <Hash className="w-4 h-4" />
            {tag}
          </motion.button>
        ))}
      </motion.div>

      {/* 清空条件按钮 */}
      <motion.button
        variants={itemVariants}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onReset}
        className="mt-8 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 
          rounded-full text-white font-medium flex items-center gap-2
          hover:from-blue-400 hover:to-blue-500 transition-colors duration-300
          shadow-lg shadow-blue-500/20"
      >
        <RotateCcw className="w-5 h-5" />
        清空筛选条件
      </motion.button>
    </motion.div>
  );
};

export default NoResults;