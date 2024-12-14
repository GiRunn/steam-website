// src/pages/store/activity-detail/components/ActivityInfo/index.jsx
import React from 'react';
import { motion } from 'framer-motion';
import styles from './styles.module.css';

const StatusBadge = ({ startTime, endTime }) => {
  const now = new Date().getTime();
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  
  if (now < start) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative px-4 py-1.5 rounded-full bg-[#1e2837] overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-all duration-300" />
        <motion.span 
          className="relative z-10 text-cyan-400 text-sm font-medium"
          whileHover={{ scale: 1.05 }}
        >
          即将开始
        </motion.span>
      </motion.div>
    );
  } else if (now > end) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative px-4 py-1.5 rounded-full bg-[#1e2837] overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/20 to-gray-400/20 opacity-0 group-hover:opacity-100 transition-all duration-300" />
        <motion.span 
          className="relative z-10 text-gray-400 text-sm font-medium"
          whileHover={{ scale: 1.05 }}
        >
          已结束
        </motion.span>
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative px-4 py-1.5 rounded-full bg-[#1e2837] overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 opacity-0 group-hover:opacity-100 transition-all duration-300" />
      <motion.span 
        className="relative z-10 text-emerald-400 text-sm font-medium"
        whileHover={{ scale: 1.05 }}
      >
        进行中
      </motion.span>
    </motion.div>
  );
};

const ActivityInfo = ({ data }) => {
  if (!data) return null;

  return (
    <div className="w-full px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full rounded-2xl overflow-hidden"
      >
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-[#1a1f2b] opacity-90">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent" />
        </div>
        
        {/* 主要内容区 */}
        <div className="relative p-8">
          {/* 顶部装饰线 */}
          <motion.div 
            className="absolute top-0 left-0 right-0 h-[2px]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500" />
          </motion.div>

          {/* 标题区域 */}
          <div className="flex justify-between items-center mb-12">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300"
            >
              {data.title}
            </motion.h2>
            <StatusBadge startTime={data.startTime} endTime={data.endTime} />
          </div>

          {/* 时间信息区域 */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className="relative p-8 rounded-xl bg-[#222632] overflow-hidden group"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              {/* 背景动效 */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-all duration-500" />
              
              {/* 时间标题 */}
              <motion.h3 
                className="text-2xl font-bold text-white mb-10"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                活动时间
              </motion.h3>
              
              {/* 时间轴 */}
              <div className="relative flex items-center justify-between px-10">
                {/* 开始时间 */}
                <motion.div 
                  className="flex flex-col items-center z-10"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="text-purple-400 font-medium mb-3 text-lg">开始时间</span>
                  <span className="text-white text-xl font-medium">{data.startTime}</span>
                </motion.div>
                
                {/* 时间轴线 */}
                <div className="absolute left-[15%] right-[15%] top-[30%]">
                  <motion.div 
                    className="h-[3px] rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1, delay: 0.6 }}
                  >
                    <motion.div 
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-purple-500"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    />
                  </motion.div>
                </div>
                
                {/* 结束时间 */}
                <motion.div 
                  className="flex flex-col items-center z-10"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="text-purple-400 font-medium mb-3 text-lg">结束时间</span>
                  <span className="text-white text-xl font-medium">{data.endTime}</span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* 活动说明区域 */}
          {data.description && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-xl blur opacity-30" />
              <div className="relative p-8 rounded-xl bg-[#222632] overflow-hidden">
                <motion.h3 
                  className="text-2xl font-bold text-white mb-6"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  活动说明
                </motion.h3>
                
                <motion.div 
                  className="text-gray-300 leading-relaxed space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {data.description}
                </motion.div>
                
                {/* 参与条件 */}
                {data.conditions && (
                  <motion.div 
                    className="mt-8 pt-8 border-t border-gray-700/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <h4 className="text-xl font-bold text-white mb-6">参与条件</h4>
                    <div className="space-y-4">
                      {data.conditions.map((condition, index) => (
                        <motion.div 
                          key={index}
                          className="flex items-start gap-3 group"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                          whileHover={{ x: 10 }}
                        >
                          <span className="text-purple-400 text-lg transform group-hover:scale-125 transition-transform">•</span>
                          <span className="text-gray-300 group-hover:text-white transition-colors">{condition}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ActivityInfo;