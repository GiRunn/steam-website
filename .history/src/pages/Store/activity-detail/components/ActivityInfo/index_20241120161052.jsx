// src/pages/store/activity-detail/components/ActivityInfo/index.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from '../../../../../components/ui/Tooltip';
import styles from './styles.module.css';

// 状态标签组件
const StatusBadge = ({ startTime, endTime }) => {
  const now = new Date().getTime();
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  
  let statusClass = `${styles.statusBadge} ${styles.active}`;
  let text = '进行中';
  
  if (now < start) {
    statusClass = `${styles.statusBadge} ${styles.upcoming}`;
    text = '即将开始';
  } else if (now > end) {
    statusClass = `${styles.statusBadge} ${styles.ended}`;
    text = '已结束';
  }
  
  return (
    <span className={statusClass}>
      {text}
    </span>
  );
};

const ActivityInfo = ({ data }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  
  if (!data) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="px-6 py-8 rounded-xl bg-[#151921] max-w-7xl mx-auto"
    >
      {/* 活动标题与状态 */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold text-white">{data.title}</h2>
        <StatusBadge startTime={data.startTime} endTime={data.endTime} />
      </div>
      
      {/* 活动时间信息 */}
      <motion.div 
        className="mb-8 p-6 rounded-xl bg-[#1c2127] border border-[#2a2f3a] transition-all hover:border-[#3a4049]"
        whileHover={{ scale: 1.01 }}
      >
        <h3 className="text-xl font-semibold text-white mb-4">活动时间</h3>
        <motion.div 
          className="flex items-center justify-between relative px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col items-center z-10">
            <span className="text-[#4f90ff] font-medium mb-2">开始时间</span>
            <span className="text-gray-300">{data.startTime}</span>
          </div>
          <div className="absolute left-0 right-0 top-[30%] h-[2px]">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#4f90ff] to-[#6366f1]"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          <div className="flex flex-col items-center z-10">
            <span className="text-[#4f90ff] font-medium mb-2">结束时间</span>
            <span className="text-gray-300">{data.endTime}</span>
          </div>
        </motion.div>
      </motion.div>

      {/* 优惠信息板块 */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-6">优惠详情</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.discounts?.map((discount, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 rounded-xl bg-[#1c2127] border border-[#2a2f3a] hover:border-[#3a4049] transition-all"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-2xl font-bold text-[#4f90ff] mb-4">
                {discount.value}
              </div>
              <div className="text-gray-300 mb-4 text-sm leading-relaxed">
                {discount.description}
              </div>
              {discount.code && (
                <div className="flex items-center gap-3 mt-4 p-3 rounded-lg bg-[#252831]">
                  <code className="text-[#4f90ff] font-mono">
                    {discount.code}
                  </code>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigator.clipboard.writeText(discount.code)}
                    className="px-4 py-1.5 rounded-md bg-[#4f90ff] text-white text-sm hover:bg-[#4080ef] transition-colors"
                  >
                    复制
                  </motion.button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* 活动说明 */}
      {data.description && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-6">活动说明</h3>
          <motion.div 
            className="p-6 rounded-xl bg-[#1c2127] border border-[#2a2f3a]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-gray-300 leading-relaxed mb-8">
              {data.description}
            </div>
            
            {/* 参与条件 */}
            {data.conditions && (
              <div className="border-t border-[#2a2f3a] pt-6">
                <h4 className="text-lg font-semibold text-white mb-4">参与条件</h4>
                <div className="space-y-3">
                  {data.conditions.map((condition, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 text-gray-300"
                    >
                      <span className="text-[#4f90ff] text-lg leading-none">•</span>
                      <span>{condition}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* 活动标签 */}
      {data.tags && (
        <div className="flex flex-wrap gap-3">
          {data.tags.map((tag, index) => (
            <Tooltip key={index} content={`查看更多${tag}相关活动`}>
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-full bg-[#1c2127] border border-[#2a2f3a] text-gray-300 hover:border-[#3a4049] cursor-pointer transition-colors"
              >
                {tag}
              </motion.span>
            </Tooltip>
          ))}
        </div>
      )}
    </motion.section>
  );
};

export default ActivityInfo;