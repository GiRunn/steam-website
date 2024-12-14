// src/pages/Community/components/Sidebar/CommunityStats.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart,
  MessageCircle,
  Users,
  Clock,
  Star 
} from 'lucide-react';
import { Tooltip } from '../../../../components/ui/Tooltip';

const CommunityStats = () => {
  const stats = [
    { label: '总帖子', value: '12.5K', icon: MessageCircle, color: 'blue' },
    { label: '活跃用户', value: '2.8K', icon: Users, color: 'green' },    
    { label: '今日发帖', value: '286', icon: Clock, color: 'yellow' },
    { label: '精华内容', value: '1.2K', icon: Star, color: 'purple' }
  ];

  return (
    <div className="bg-[#0f1724] rounded-xl p-6">
      <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
        <BarChart className="w-5 h-5 text-blue-400" />
        <span>社区数据</span>  
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <Tooltip key={stat.label} content={`${stat.label}统计`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-gradient-to-br from-white/5 to-white/0 rounded-lg hover:from-white/10 transition-colors duration-300 group cursor-pointer"
            >
              <stat.icon className={`w-5 h-5 text-${stat.color}-400 mb-2 group-hover:scale-110 transition-transform duration-300`} />
              <div className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
                {stat.value}
              </div>
              <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                {stat.label}
              </div>
            </motion.div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default CommunityStats;