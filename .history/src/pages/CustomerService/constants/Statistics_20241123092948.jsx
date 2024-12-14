// src/pages/CustomerService/components/Statistics.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Clock, CheckCircle, MessageCircle, TrendingUp } from 'lucide-react';
import { TICKET_STATUS } from '../constants/ticketConfig';

/**
 * StatIcon - 统计图标子组件
 */
const StatIcon = ({ icon: Icon, color, isHovered }) => (
  <motion.div
    initial={{ rotate: -15 }}
    animate={{ rotate: isHovered ? 0 : -15 }}
    whileHover={{ scale: 1.1 }}
    className={`relative p-4 rounded-2xl ${color.iconBg} backdrop-blur-sm`}
  >
    <Icon className={`w-6 h-6 ${color.iconColor}`} strokeWidth={1.5} />
    <motion.div
      className="absolute inset-0 rounded-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: isHovered ? 1 : 0 }}
      transition={{ duration: 0.2 }}
      style={{
        background: `radial-gradient(circle at center, ${color.glow} 0%, transparent 70%)`
      }}
    />
  </motion.div>
);

/**
 * TrendIndicator - 趋势指示器子组件
 */
const TrendIndicator = ({ trend = 'up', color }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex items-center gap-1 text-xs ${color.trendColor}`}
  >
    <TrendingUp className="w-3 h-3" />
    <span>12.5%</span>
  </motion.div>
);

/**
 * StatCard - 统计卡片子组件
 */
const StatCard = ({ stat, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  const colorSchemes = {
    blue: {
      iconBg: 'bg-blue-950/50',
      iconColor: 'text-blue-400',
      glow: 'rgba(59, 130, 246, 0.3)',
      borderGlow: 'group-hover:border-blue-500/30',
      gradientFrom: 'from-blue-500/10',
      gradientTo: 'to-transparent',
      trendColor: 'text-blue-400',
      textGlow: 'group-hover:text-blue-400'
    },
    yellow: {
      iconBg: 'bg-amber-950/50',
      iconColor: 'text-amber-400',
      glow: 'rgba(251, 191, 36, 0.3)',
      borderGlow: 'group-hover:border-amber-500/30',
      gradientFrom: 'from-amber-500/10',
      gradientTo: 'to-transparent',
      trendColor: 'text-amber-400',
      textGlow: 'group-hover:text-amber-400'
    },
    green: {
      iconBg: 'bg-emerald-950/50',
      iconColor: 'text-emerald-400',
      glow: 'rgba(16, 185, 129, 0.3)',
      borderGlow: 'group-hover:border-emerald-500/30',
      gradientFrom: 'from-emerald-500/10',
      gradientTo: 'to-transparent',
      trendColor: 'text-emerald-400',
      textGlow: 'group-hover:text-emerald-400'
    },
    purple: {
      iconBg: 'bg-purple-950/50',
      iconColor: 'text-purple-400',
      glow: 'rgba(168, 85, 247, 0.3)',
      borderGlow: 'group-hover:border-purple-500/30',
      gradientFrom: 'from-purple-500/10',
      gradientTo: 'to-transparent',
      trendColor: 'text-purple-400',
      textGlow: 'group-hover:text-purple-400'
    }
  };

  const colors = colorSchemes[stat.color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative rounded-2xl bg-[#0a0f16] border border-gray-800/50
        ${colors.borderGlow} transition-all duration-500`}
    >
      {/* 背景渐变 */}
      <div className="absolute inset-0 rounded-2xl transition-opacity duration-500">
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 
          group-hover:opacity-100 transition-opacity duration-500
          ${colors.gradientFrom} ${colors.gradientTo}`}
        />
      </div>

      {/* 内容区域 */}
      <div className="relative p-6 space-y-4">
        <div className="flex items-center justify-between">
          <StatIcon icon={stat.icon} color={colors} isHovered={isHovered} />
          <TrendIndicator color={colors} />
        </div>

        <div className="space-y-2">
          <motion.div 
            className={`text-3xl font-semibold text-gray-200 transition-colors
              duration-300 ${colors.textGlow}`}
          >
            {stat.value}
          </motion.div>
          <div className="text-sm text-gray-500 font-medium">
            {stat.label}
          </div>
        </div>

        {/* 装饰性元素 */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-0 left-0 right-0 h-1"
            >
              <div className={`h-full bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo}`} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 悬浮时的光晕效果 */}
      <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 
        transition-opacity duration-500 blur-md"
        style={{
          background: `radial-gradient(circle at center, ${colors.glow}, transparent 70%)`
        }}
      />
    </motion.div>
  );
};

/**
 * Statistics - 统计数据展示主组件
 */
const Statistics = () => {
  const stats = [
    { 
      label: '总服务工单', 
      value: TICKET_STATUS.total, 
      icon: FileText, 
      color: 'blue'
    },
    { 
      label: '处理中', 
      value: TICKET_STATUS.processing, 
      icon: Clock, 
      color: 'yellow'
    },
    { 
      label: '已解决', 
      value: TICKET_STATUS.resolved, 
      icon: CheckCircle, 
      color: 'green'
    },
    { 
      label: '满意度', 
      value: `${TICKET_STATUS.satisfaction}%`, 
      icon: MessageCircle, 
      color: 'purple'
    }
  ];

  return (
    <div className="relative">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent 
        rounded-3xl blur-3xl -z-10" />
      
      {/* 统计卡片网格 */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
      >
        {stats.map((stat, index) => (
          <StatCard key={stat.label} stat={stat} index={index} />
        ))}
      </motion.div>
    </div>
  );
};

export default Statistics;