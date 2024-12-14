// src/pages/store/activity-detail/components/ActivityInfo/index.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from '../../../../../components/ui/Tooltip';
import styles from './styles.module.css';

const StatusBadge = ({ startTime, endTime }) => {
  const now = new Date().getTime();
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  
  if (now < start) {
    return (
      <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-400 text-sm font-medium">
        即将开始
      </div>
    );
  } else if (now > end) {
    return (
      <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-gray-500/20 to-gray-400/20 text-gray-400 text-sm font-medium">
        已结束
      </div>
    );
  }
  
  return (
    <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-emerald-400 text-sm font-medium">
      进行中
    </div>
  );
};

const ActivityInfo = ({ data }) => {
  const [activeDiscount, setActiveDiscount] = useState(null);
  
  if (!data) return null;

  return (
    <div className="w-full px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full rounded-2xl bg-[#1a1f2b] overflow-hidden"
      >
        {/* 顶部装饰条 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500" />
        
        <div className="p-8">
          {/* 标题区域 */}
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-white">{data.title}</h2>
            <StatusBadge startTime={data.startTime} endTime={data.endTime} />
          </div>

          {/* 时间轴区域 */}
          <motion.div 
            className="mb-12 p-6 rounded-xl bg-[#222632] relative overflow-hidden group"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <h3 className="text-2xl font-bold text-white mb-8">活动时间</h3>
            <div className="relative flex items-center justify-between">
              <motion.div 
                className="flex flex-col items-center z-10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="text-cyan-400 font-medium mb-3">开始时间</span>
                <span className="text-white text-lg">{data.startTime}</span>
              </motion.div>
              
              {/* 时间轴线 */}
              <motion.div 
                className="absolute left-[10%] right-[10%] top-[28%] h-[2px] bg-gradient-to-r from-blue-500 to-cyan-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
              
              <motion.div 
                className="flex flex-col items-center z-10"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="text-cyan-400 font-medium mb-3">结束时间</span>
                <span className="text-white text-lg">{data.endTime}</span>
              </motion.div>
            </div>
          </motion.div>

          {/* 优惠信息区域 */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-8">优惠详情</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.discounts?.map((discount, index) => (
                <motion.div
                  key={index}
                  className="group relative rounded-xl bg-[#222632] overflow-hidden cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setActiveDiscount(activeDiscount === index ? null : index)}
                >
                  {/* 背景装饰 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="p-6">
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-4">
                      {discount.value}
                    </div>
                    <div className="text-gray-300 mb-4">
                      {discount.description}
                    </div>
                    {discount.code && (
                      <div className="flex items-center gap-4 p-3 rounded-lg bg-[#1a1f2b]">
                        <code className="text-cyan-400 font-mono">{discount.code}</code>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(discount.code);
                          }}
                          className="px-4 py-1.5 rounded-md bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm hover:from-blue-600 hover:to-cyan-600 transition-colors"
                        >
                          复制
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 活动说明区域 */}
          {data.description && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-white mb-8">活动说明</h3>
              <motion.div 
                className="rounded-xl bg-[#222632] overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="p-6">
                  <div className="text-gray-300 leading-relaxed mb-8">
                    {data.description}
                  </div>
                  
                  {data.conditions && (
                    <div className="border-t border-gray-700/50 pt-6">
                      <h4 className="text-xl font-bold text-white mb-6">参与条件</h4>
                      <div className="space-y-4">
                        {data.conditions.map((condition, index) => (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-3"
                          >
                            <span className="text-cyan-400 text-lg">•</span>
                            <span className="text-gray-300">{condition}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {/* 标签区域 */}
          {data.tags && (
            <div className="flex flex-wrap gap-3">
              {data.tags.map((tag, index) => (
                <Tooltip key={index} content={`查看更多${tag}相关活动`}>
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-full bg-[#222632] text-gray-300 hover:text-cyan-400 cursor-pointer transition-colors"
                  >
                    {tag}
                  </motion.span>
                </Tooltip>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ActivityInfo;