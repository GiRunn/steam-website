// src/pages/CustomerService/constants/OnlineService.jsx
import React, { useState } from 'react';
import { MessageSquare, Clock, Users, HeartHandshake, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ServiceStatus - 客服状态指示器子组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.isOnline - 在线状态
 */
const ServiceStatus = ({ isOnline = true }) => (
  <motion.div 
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center gap-2 bg-[#1a1f2c]/50 px-3 py-1.5 rounded-full"
  >
    <motion.div
      animate={{ 
        scale: isOnline ? [1, 1.2, 1] : 1,
        opacity: isOnline ? [0.5, 1, 0.5] : 0.5 
      }}
      transition={{ 
        repeat: Infinity,
        duration: 2,
        ease: "easeInOut"
      }}
      className={`w-2 h-2 rounded-full ${
        isOnline ? 'bg-green-400' : 'bg-gray-400'
      }`}
    />
    <span className="text-sm font-medium bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
      {isOnline ? '在线服务中' : '离线'}
    </span>
  </motion.div>
);

/**
 * ServiceFeature - 服务特点子组件
 * @param {Object} props - 组件属性
 * @param {ReactElement} props.icon - 图标组件
 * @param {string} props.text - 特点描述
 * @param {number} props.delay - 动画延迟
 */
const ServiceFeature = ({ icon: Icon, text, description, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
    className="relative group"
  >
    {/* 背景容器 */}
    <div className="relative p-4 rounded-lg bg-gradient-to-br from-[#1a1f2c]/80 to-[#1a1f2c]/60
      border border-gray-800/30 hover:border-gray-700/50 transition-all duration-300
      hover:bg-[#1a1f2c]/90">
      
      {/* 渐变光效 */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-lg
        opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-start gap-4">
        {/* 图标容器 */}
        <div className="flex-shrink-0">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="p-2.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/10
              ring-1 ring-blue-500/20 shadow-lg shadow-blue-500/5"
          >
            <Icon className="w-5 h-5 text-blue-400" />
          </motion.div>
        </div>

        {/* 文字内容容器 */}
        <div className="flex-grow">
          <h4 className="text-base font-medium text-gray-200 mb-1
            bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
            {text}
          </h4>
          <p className="text-sm text-gray-400 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  </motion.div>
);

/**
 * ServiceButton - 客服按钮子组件
 * @param {Object} props - 组件属性
 * @param {Function} props.onClick - 点击处理函数
 * @param {boolean} props.isHovered - 悬停状态
 */
const ServiceButton = ({ onClick, isHovered }) => {
  const [localHover, setLocalHover] = useState(false);
  
  return (
    <motion.div
      className="relative"
      onMouseEnter={() => setLocalHover(true)}
      onMouseLeave={() => setLocalHover(false)}
    >
      {/* 光晕效果 */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl blur-xl"
        animate={{
          scale: localHover ? 1.1 : 0.9,
          opacity: localHover ? 0.8 : 0
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
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative group cursor-pointer"
      >
        {/* 渐变边框 */}
        <div className="relative bg-gradient-to-r from-purple-500/50 to-blue-500/50 p-0.5 rounded-xl">
          <div className="relative flex items-center gap-4 px-5 py-4 bg-[#1a1f2c]/90 rounded-[10px]
            group-hover:bg-[#1a1f2c]/70 transition-all duration-300">
            {/* 图标容器 */}
            <div className="relative">
              <motion.div
                animate={{
                  rotate: localHover ? [0, 15, -15, 0] : 0
                }}
                transition={{ duration: 0.5 }}
                className="p-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20"
              >
                <MessageSquare className="w-6 h-6 text-purple-400" />
              </motion.div>
            </div>

            {/* 文字内容 */}
            <div className="flex-grow">
              <div className="text-base font-medium text-gray-100 mb-1">在线客服</div>
              <div className="text-sm text-gray-400">随时为您解答问题</div>
            </div>

            {/* 箭头 */}
            <motion.div
              animate={{
                x: localHover ? 5 : 0,
                opacity: localHover ? 1 : 0.5,
              }}
              className="text-gray-400"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

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
    { 
      icon: Clock, 
      text: '7x24小时全天候服务',
      delay: 0.1
    },
    { 
      icon: Users, 
      text: '专业客服团队快速响应',
      delay: 0.2
    },
    { 
      icon: HeartHandshake, 
      text: '贴心解答您的每一个疑问',
      delay: 0.3
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-[#0a0f16] border border-gray-800/50 rounded-xl p-6 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 背景动画效果 */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-purple-500/5"
        animate={{
          opacity: isHovered ? 1 : 0.5,
          scale: isHovered ? 1.05 : 1,
          rotate: isHovered ? 5 : 0,
        }}
        transition={{ duration: 0.5 }}
      />

      {/* 装饰性光点 */}
      <motion.div
        className="absolute w-32 h-32 rounded-full bg-purple-500/10 blur-3xl"
        animate={{
          x: isHovered ? [-10, 10, -10] : 0,
          y: isHovered ? [-10, 10, -10] : 0,
          opacity: isHovered ? 0.8 : 0.3,
        }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ top: '20%', right: '10%' }}
      />

      {/* 主要内容 */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <motion.h3 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl font-bold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent"
          >
            联系我们
          </motion.h3>
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
              description={feature.description}
              delay={feature.delay}
            />
          ))}
        </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default OnlineService;