import React from 'react';
import { motion } from 'framer-motion';
import { Search, RefreshCcw } from 'lucide-react';

const NoResults = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      {/* 图标和动画 */}
      <div className="relative mb-6">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 360]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="absolute -right-2 -top-2"
        >
          <RefreshCcw className="w-6 h-6 text-blue-500" />
        </motion.div>
        <Search className="w-16 h-16 text-gray-600" />
      </div>

      {/* 文本信息 */}
      <h3 className="text-2xl font-semibold text-white mb-3">
        未找到相关视频
      </h3>
      <p className="text-gray-400 text-center max-w-md mb-8">
        抱歉，没有找到匹配的视频指南。请尝试使用不同的关键词或浏览其他分类。
      </p>

      {/* 建议 */}
      <div className="bg-[#1a1f2e] rounded-xl p-6 max-w-lg w-full">
        <h4 className="text-lg font-medium text-white mb-4">
          搜索建议：
        </h4>
        <ul className="space-y-3 text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            检查输入的关键词是否正确
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            尝试使用更简单或通用的搜索词
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            浏览不同的视频分类
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            查看最新发布的视频指南
          </li>
        </ul>
      </div>
    </motion.div>
  );
};

export default NoResults;