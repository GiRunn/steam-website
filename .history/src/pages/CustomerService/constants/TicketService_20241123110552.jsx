// src/pages/CustomerService/constants/TicketService.jsx
import React, { useState } from 'react';
import { Plus, Headphones, Clock, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';  // 新增导入

/**
 * ServiceCard - 服务特性展示卡片子组件
 * @param {Object} props - 组件属性
 * @param {string} props.icon - 图标组件
 * @param {string} props.title - 标题文本
 * @param {string} props.description - 描述文本
 */
const ServiceCard = ({ Icon, title, description }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-start gap-3 p-4 rounded-lg bg-gray-800/30"
  >
    <div className="p-2 rounded-lg bg-blue-500/20">
      <Icon className="w-5 h-5 text-blue-400" />
    </div>
    <div>
      <h4 className="text-sm font-semibold text-gray-200 mb-1">{title}</h4>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  </motion.div>
);

// src/pages/CustomerService/constants/TicketService.jsx
// 仅展示修改的 CreateTicketButton 组件部分，其他代码保持不变

/**
 * CreateTicketButton - 创建工单按钮子组件
 * 提供高级的视觉效果和交互体验
 * @param {Object} props - 组件属性
 * @param {Function} props.onClick - 点击处理函数
 */
const CreateTicketButton = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 光晕效果 */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-xl blur-xl"
        animate={{
          scale: isHovered ? 1.1 : 0.9,
          opacity: isHovered ? 0.8 : 0
        }}
        transition={{ duration: 0.3 }}
      />

      {/* 主按钮 */}
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="relative w-full group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl" />
        
        {/* 按钮内容和其他效果保持不变... */}
        <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-0.5 backdrop-blur-sm">
          <div className="relative flex items-center justify-center gap-3 px-8 py-3.5 bg-[#0a0f16]/90 rounded-[10px] 
            group-hover:bg-[#0a0f16]/70 transition-colors">
            
            <motion.div
              animate={{
                rotate: isHovered ? 180 : 0
              }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <Plus className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
            </motion.div>
            
            <span className="text-base font-medium bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
              创建工单
            </span>
          </div>
        </div>

        {/* 装饰性光点 */}
        <motion.div
          className="absolute w-1.5 h-1.5 rounded-full bg-blue-400"
          animate={{
            x: isHovered ? [0, 4, 0] : 0,
            opacity: isHovered ? [0, 1, 0] : 0
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ top: '50%', left: '30%' }}
        />
        <motion.div
          className="absolute w-1.5 h-1.5 rounded-full bg-purple-400"
          animate={{
            x: isHovered ? [0, -4, 0] : 0,
            opacity: isHovered ? [0, 1, 0] : 0
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ top: '50%', right: '30%' }}
        />
      </motion.button>
    </motion.div>
  );
};


/**
 * TicketService - 工单服务入口主组件
 * 提供创建工单的服务入口和服务特性展示
 */
const TicketService = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();  // 使用 useNavigate hook

  // 更新处理函数，添加导航逻辑
  const handleCreateTicket = () => {
    // 修改为正确的路径格式
    navigate('/customer-service/unavailable');
  };

  const serviceFeatures = [
    {
      Icon: Headphones,
      title: "专业客服支持",
      description: "经验丰富的客服团队为您解答问题"
    },
    {
      Icon: Clock,
      title: "快速响应",
      description: "工作时间内15分钟内响应"
    },
    {
      Icon: MessageSquare,
      title: "全程跟进",
      description: "问题解决前持续跟进服务"
    }
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
        className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5"
        animate={{
          opacity: isHovered ? 1 : 0.5,
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* 主要内容 */}
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-gray-100 mb-2">需要更多帮助？</h3>
        <p className="text-gray-400 mb-6">创建工单获取专业客服支持，我们将竭诚为您服务</p>
        
        {/* 服务特性展示 */}
        <div className="grid gap-4 mb-6">
          <AnimatePresence>
            {serviceFeatures.map((feature, index) => (
              <ServiceCard
                key={index}
                Icon={feature.Icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* 创建工单按钮 */}
        <CreateTicketButton onClick={handleCreateTicket} />
      </div>
    </motion.div>
  );
};
export default TicketService;