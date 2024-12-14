// E:\Steam\steam-website\src\pages\VideoGuides\components\NoResults.jsx
// 用途：当搜索结果为空时显示的提示组件

import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const NoResults = () => {
  return (
    <div className="text-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-white mb-2">
          未找到相关视频
        </h3>
        <p className="text-gray-400">
          试试其他关键词或浏览不同分类
        </p>
      </motion.div>
    </div>
  );
};

export default NoResults;