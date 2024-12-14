// src/pages/CustomerService/components/Statistics.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, MessageCircle } from 'lucide-react';
import { TICKET_STATUS } from '../constants/ticketConfig';

/**
 * StatCard - 统计卡片子组件
 */
const StatCard = ({ stat, index }) => {
  const colorMap = {
    blue: {
      bgGradient: 'from-blue-500/20 to-blue-600/10',
      iconColor: 'text-blue-400',
      textGradient: 'from-blue-200 to-blue-400',
      lightGlow: 'bg-blue-500/20',
      hoverBorder: 'group-hover:border-blue-500/30'
    },
    yellow: {
      bgGradient: 'from-amber-500/20 to-amber-600/10',
      iconColor: 'text-amber-400',
      textGradient: 'from-amber-200 to-amber-400',
      lightGlow: 'bg-amber-500/20',
      hoverBorder: 'group-hover:border-amber-500/30'
    },
    green: {
      bgGradient: 'from-emerald-500/20 to-emerald-600/10',
      iconColor: 'text-emerald-400',
      textGradient: 'from-emerald-200 to-emerald-400',
      lightGlow: 'bg-emerald-500/20',
      hoverBorder: 'group-hover:border-emerald-500/30'
    },
    purple: {
      bgGradient: 'from-purple-500/20 to-purple-600/10',
      iconColor: 'text-purple-400',
      textGradient: 'from-purple-200 to-purple-400',
      lightGlow: 'bg-purple-500/20',
      hoverBorder: 'group-hover:border-purple-500/30'
    }
  };

  const colors = colorMap[stat.color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }}
      className="relative group"
    >
      {/* 背景光晕 */}
      <motion.div
        className={`absolute inset-0 rounded-xl blur-xl ${colors.lightGlow}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1 }}
      />

      {/* 主卡片 */}
      <div className={`relative bg-[#0a0f16] border border-gray-800/50 ${colors.hoverBorder}
        rounded-xl p-6 hover:bg-[#0f1621] transition-all duration-300 
        backdrop-blur-sm overflow-hidden group`}
      >
        {/* 装饰背景 */}
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bgGradient} opacity-20`} />
        <div className="absolute inset-0 bg-grid-white/[0.02]" />

        {/* 卡片内容 */}
        <div className="relative z-10">
          {/* 图标区域 */}
          <motion.div
            className="relative mb-4"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors.bgGradient}
              flex items-center justify-center`}
            >
              <stat.icon className={`w-7 h-7 ${colors.iconColor}`} />
            </div>
            
            {/* 装饰光点 */}
            <motion.div
              className={`absolute w-1 h-1 rounded-full ${colors.iconColor}`}
              animate={{
                opacity: [0, 1, 0],
                scale: [1, 1.5, 1],
                x: [0, 10, 0],
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          </motion.div>

          {/* 数值 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="space-y-2"
          >
            <div className={`text-3xl font-bold bg-gradient-to-r ${colors.textGradient} bg-clip-text text-transparent`}>
              {stat.value}
            </div>
            <div className="text-gray-400 text-sm font-medium">
              {stat.label}
            </div>
          </motion.div>

          {/* hover 时显示的装饰线 */}
          <motion.div
            className={`absolute bottom-0 left-0 h-0.5 ${colors.bgGradient}`}
            initial={{ width: "0%" }}
            whileHover={{ width: "100%" }}
            transition={{ duration: 0.3 }}
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
    { label: '总服务工单', value: TICKET_STATUS.total, icon: FileText, color: 'blue' },
    { label: '处理中', value: TICKET_STATUS.processing, icon: Clock, color: 'yellow' },
    { label: '已解决', value: TICKET_STATUS.resolved, icon: CheckCircle, color: 'green' },
    { label: '满意度', value: `${TICKET_STATUS.satisfaction}%`, icon: MessageCircle, color: 'purple' }
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