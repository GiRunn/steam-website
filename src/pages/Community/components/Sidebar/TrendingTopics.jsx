// src/pages/Community/components/Sidebar/TrendingTopics.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Hash, Plus, TrendingUp } from 'lucide-react';
import { TRENDING_TAGS } from '../../constants';
import { Tooltip } from '../../../../components/ui/Tooltip';

const TrendingTopics = () => {
  return (
    <div className="bg-[#0f1724] rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" />
          <span>热门话题</span>
        </h3>
        <Tooltip content="查看更多">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400"
          >
            <TrendingUp className="w-4 h-4" />
          </motion.button>
        </Tooltip>
      </div>
      <div className="space-y-4">
        {TRENDING_TAGS.map((tag, index) => (
          <motion.div
            key={tag.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400/20 to-red-400/20 flex items-center justify-center group-hover:from-orange-400/30 group-hover:to-red-400/30 transition-colors duration-300">
                <Hash className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <span className="font-medium text-white group-hover:text-blue-400 transition-colors duration-300">
                  #{tag.name}
                </span>
                <div className="text-sm text-gray-400">
                  {tag.count} 讨论
                </div>
              </div>
            </div>
            <Tooltip content="参与话题">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 rounded-lg bg-white/10 text-gray-400"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>
            </Tooltip>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TrendingTopics;