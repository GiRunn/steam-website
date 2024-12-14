// src/pages/CustomerService/ServiceUnavailable.jsx
// 客服功能暂不可用的全屏提示页面组件

import React from 'react';
import { motion } from 'framer-motion';
import { HeadphonesIcon, MessageCircleIcon, ArrowLeft } from 'lucide-react'; // 新增 ArrowLeft
import { useNavigate } from 'react-router-dom'; // 新增


// 客服联系按钮组件
const ContactButton = ({ icon: Icon, text, onClick, className = '' }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-3 px-6 py-3 
        bg-gradient-to-r from-blue-500/10 to-purple-500/10 
        border border-gray-700/50 rounded-lg
        text-gray-200 hover:text-white
        transition-colors ${className}`}
      onClick={onClick}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{text}</span>
    </motion.button>
  );
};

const ServiceUnavailable = () => {
    const navigate = useNavigate();
  
    const handleBack = () => {
      navigate('/support');
    };
  
    const handleLiveChat = () => {
      console.log('打开在线客服');
    };
  
    return (
      <div className="fixed inset-0 bg-[#0a0f16] flex flex-col items-center justify-center">
        {/* 背景网格和光效 - 降低 z-index */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.1) 1px, transparent 0)',
              backgroundSize: '20px 20px'
            }}
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
              w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-3xl"
          />
        </div>
  
        {/* 返回按钮 - 提高 z-index */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleBack}
          className="fixed top-6 left-6 flex items-center gap-2 
            px-4 py-2 rounded-lg
            bg-gray-800/50 hover:bg-gray-700/50
            text-gray-400 hover:text-gray-200
            transition-all duration-200 z-50
            border border-gray-700/30 hover:border-gray-600/50
            cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">返回</span>
        </motion.button>
  
        {/* 主要内容区域 - 提高 z-index */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-2xl mx-auto px-6 text-center"
        >
          {/* 图标部分保持不变... */}
          <motion.div
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="mb-8 inline-block"
          >
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"
              />
              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 
                rounded-2xl p-4 shadow-xl">
                <HeadphonesIcon className="w-full h-full text-white" />
              </div>
            </div>
          </motion.div>
  
          {/* 标题和说明文字 */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-white mb-4"
          >
            自助提交工单暂不可用
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 text-lg mb-8"
          >
            我们正在升级系统以便为您提供更好的服务。
            <br />
            在此期间，请联系我们的客服团队为你创建解决方案
          </motion.p>
  
          {/* 联系按钮组 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <ContactButton 
              icon={MessageCircleIcon}
              text="在线客服"
              onClick={handleLiveChat}
            />
          </motion.div>
  
          {/* 补充信息 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-sm text-gray-500"
          >
            服务时间：周一至周日 9:00 - 22:00
          </motion.p>
        </motion.div>
      </div>
    );
  };

export default ServiceUnavailable;