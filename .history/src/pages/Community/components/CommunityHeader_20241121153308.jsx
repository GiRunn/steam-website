// src/pages/Community/components/CommunityHeader.jsx

import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Plus,
  BarChart,
  Users,
  MessageCircle,
  Eye,
  ChevronDown,
  Flame
} from 'lucide-react';
import { Tooltip } from '../../../components/ui/Tooltip';

// 统计数据子组件
const StatisticItem = ({ icon: Icon, label, value }) => (
  <Tooltip content={label}>
    <div className="flex items-center gap-1">
      <Icon className="w-4 h-4" />
      <span>{value}</span>
    </div>
  </Tooltip>
);

// 标题区域子组件
const HeaderTitle = () => (
  <div className="flex items-center gap-6">
    <div className="flex flex-col items-center">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-2xl shadow-lg shadow-blue-500/25">
        <CheckCircle className="w-8 h-8 text-white" />
      </div>
      <div className="mt-2 w-px h-16 bg-gradient-to-b from-blue-500 to-transparent" />
    </div>

    <div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"  
      >
        Steam 社区
      </motion.h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}  
        className="mt-2 flex items-center gap-4 text-gray-400"
      >
        <StatisticItem 
          icon={Users} 
          label="活跃用户" 
          value="12.5K 活跃用户" 
        />
        <StatisticItem 
          icon={MessageCircle} 
          label="今日发帖" 
          value="5.2K 今日发帖" 
        />
        <StatisticItem 
          icon={Eye} 
          label="今日浏览" 
          value="25.6K 今日浏览" 
        />
      </motion.div>
    </div>
  </div>
);

// 操作按钮区域子组件
const ActionButtons = ({ onCreatePost }) => (
  <div className="flex items-center gap-4">
    <Tooltip content="查看数据">
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
      >
        <BarChart className="w-5 h-5" />
        <span>社区数据</span>
      </motion.button>
    </Tooltip>

    <Tooltip content="发布新帖">
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCreatePost}
        className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium shadow-lg shadow-blue-500/25"
      >
        <div className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span>发布内容</span>
        </div>
      </motion.button>
    </Tooltip>
  </div>
);

// 公告卡片子组件
const AnnouncementCard = ({ index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 * index }}
    className="group relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-4 hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-300"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

    <div className="relative flex items-start gap-3">
      <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 p-0.5">
        <div className="w-full h-full bg-[#0f1724] rounded-[7px] flex items-center justify-center">
          <Flame className="w-6 h-6 text-blue-400" /> 
        </div>
      </div>

      <div className="flex-1">
        <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors duration-300">
          新版本更新公告
        </h3>
        <p className="mt-1 text-sm text-gray-400 line-clamp-2 group-hover:text-gray-300 transition-colors duration-300">
          我们很高兴地宣布,游戏将在下周推出重大更新...
        </p>
      </div>

      <Tooltip content="展开查看">
        <motion.button
          whileHover={{ scale: 1.1 }}  
          whileTap={{ scale: 0.9 }}
          className="flex-shrink-0 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors duration-300"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.button>
      </Tooltip>
    </div>
  </motion.div>
);

// 公告轮播区域子组件
const AnnouncementCarousel = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
    className="grid grid-cols-3 gap-6"
  >
    {[0, 1, 2].map((index) => (
      <AnnouncementCard key={index} index={index} />
    ))}
  </motion.div>
);

// 装饰背景子组件
const DecorativeBackground = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-0 bg-pattern opacity-5" />
    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
  </div>
);

// 主组件
const CommunityHeader = ({ onCreatePost }) => {
  return (
    <div className="mb-8">
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0f1724] to-[#141d2e] rounded-2xl p-8">
        <DecorativeBackground />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-8">
            <HeaderTitle />
            <ActionButtons onCreatePost={onCreatePost} />
          </div>
          
          <AnnouncementCarousel />
        </div>
      </div>
    </div>
  );
};

export default CommunityHeader;