// src/pages/CustomerService/constants/OnlineService.jsx
import React, { useState } from 'react';
import { MessageSquare, Clock, Users, HeartHandshake } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ServiceStatus - 客服状态指示器子组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.isOnline - 在线状态
 */
const ServiceStatus = ({ isOnline = true }) => (
  <div className="flex items-center gap-2">
    <motion.div
      animate={{ scale: isOnline ? [1, 1.2, 1] : 1 }}
      transition={{ repeat: Infinity, duration: 2 }}
      className={`w-2 h-2 rounded-full ${
        isOnline ? 'bg-green-400' : 'bg-gray-400'
      }`}
    />
    <span className="text-sm text-gray-400">
      {isOnline ? '在线' : '离线'}
    </span>
  </div>
);

/**
 * ServiceFeature - 服务特点子组件
 * @param {Object} props - 组件属性
 * @param {ReactElement} props.icon - 图标组件
 * @param {string} props.text - 特点描述
 */
const ServiceFeature = ({ icon: Icon, text }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-2 text-gray-400"
  >
    <Icon className="w-4 h-4 text-blue-400" />
    <span className="text-sm">{text}</span>
  </motion.div>
);

/**
 * ServiceButton - 客服按钮子组件
 * @param {Object} props - 组件属性
 * @param {Function} props.onClick - 点击处理函数
 * @param {boolean} props.isHovered - 悬停状态
 */
const ServiceButton = ({ onClick, isHovered }) => (
  <motion.div
    className="relative overflow-hidden rounded-lg"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20"
      animate={{
        opacity: isHovered ? 1 : 0.5,
        scale: isHovered ? 1.05 : 1,
      }}
      transition={{ duration: 0.3 }}
    />
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="relative flex items-center gap-4 p-4 bg-[#1a1f2c]/80 
        hover:bg-[#242936] transition-colors cursor-pointer"
    >
      <div className="p-2 rounded-lg bg-purple-500/20">
        <MessageSquare className="w-6 h-6 text-purple-400" />
      </div>
      <div className="flex-grow">
        <div className="text-gray-100 font-medium mb-1">在线客服</div>
        <ServiceStatus />
      </div>
    </motion.div>
  </motion.div>
);

/**
 * OnlineService - 在线客服入口主组件
 * 提供在线客服服务入口和服务特性展示
 */
const OnlineService = () => {
  const [isHovered, setIsHovered] = useState(false);

  const handleOpenChat = () => {
    // TODO: 实现在线客服对话框打开逻辑
    console.log('打开在线客服');
  };

  const serviceFeatures = [
    { icon: Clock, text: '7x24小时在线服务' },
    { icon: Users, text: '专业客服团队' },
    { icon: HeartHandshake, text: '贴心解答疑问' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-[#0a0f16] border border-gray-800/50 rounded-xl p-6 relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 背景动画效果 */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5"
        animate={{
          opacity: isHovered ? 1 : 0.5,
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* 主要内容 */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-100">联系我们</h3>
          <ServiceStatus />
        </div>

        {/* 服务按钮 */}
        <ServiceButton onClick={handleOpenChat} isHovered={isHovered} />

        {/* 服务特性 */}
        <div className="mt-6 grid gap-3">
          <AnimatePresence>
            {serviceFeatures.map((feature, index) => (
              <ServiceFeature
                key={index}
                icon={feature.icon}
                text={feature.text}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default OnlineService;