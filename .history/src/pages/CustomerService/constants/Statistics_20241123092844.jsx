// src/pages/CustomerService/components/Statistics.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, MessageCircle } from 'lucide-react';
import { TICKET_STATUS } from '../constants/ticketConfig';

/**
 * StatCard - 统计卡片子组件
 */
const StatCard = ({ stat, index }) => {
  const colorVariants = {
    blue: {
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      glowColor: 'from-blue-500/5 to-transparent',
      hoverBorder: 'group-hover:border-blue-500/30',
      hoverGlow: 'group-hover:bg-blue-500/5'
    },
    yellow: {
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
      glowColor: 'from-amber-500/5 to-transparent',
      hoverBorder: 'group-hover:border-amber-500/30',
      hoverGlow: 'group-hover:bg-amber-500/5'
    },
    green: {
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
      glowColor: 'from-emerald-500/5 to-transparent',
      hoverBorder: 'group-hover:border-emerald-500/30',
      hoverGlow: 'group-hover:bg-emerald-500/5'
    },
    purple: {
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
      glowColor: 'from-purple-500/5 to-transparent',
      hoverBorder: 'group-hover:border-purple-500/30',
      hoverGlow: 'group-hover:bg-purple-500/5'
    }
  };

  const colors = colorVariants[stat.color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.1,
        duration: 0.3,
        ease: "easeOut"
      }}
      className="relative group"
    >
      <div className={`relative p-6 rounded-2xl border border-gray-800/50 
        bg-[#0a0f16] ${colors.hoverBorder} ${colors.hoverGlow}
        transition-all duration-300 h-full`}
      >
        {/* 顶部图标区域 */}
        <div className="flex items-center justify-between mb-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`p-3 rounded-xl ${colors.iconBg}`}
          >
            <stat.icon className={`w-6 h-6 ${colors.iconColor}`} />
          </motion.div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.2 }}
            className={`h-1.5 w-1.5 rounded-full ${colors.iconBg} ${colors.iconColor}`}
          />
        </div>

        {/* 数值和标签 */}
        <div className="space-y-1">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.3 }}
            className="text-2xl font-bold text-gray-100"
          >
            {stat.value}
          </motion.div>
          <div className="text-sm text-gray-500 font-medium">
            {stat.label}
          </div>
        </div>

        {/* 底部装饰线 */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] overflow-hidden">
          <motion.div
            className={`h-full w-full bg-gradient-to-r ${colors.glowColor}`}
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
    >
      {stats.map((stat, index) => (
        <StatCard key={stat.label} stat={stat} index={index} />
      ))}
    </motion.div>
  );
};

export default Statistics;