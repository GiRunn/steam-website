// src/pages/store/activity-detail/components/ActivityInfo/index.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from '../../../../../components/ui/Tooltip';
import styles from './styles.module.css';

// 活动状态标签组件
const StatusBadge = ({ startTime, endTime }) => {
  const now = new Date().getTime();
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  
  let status = {
    text: '进行中',
    bgColor: 'bg-green-500'
  };
  
  if (now < start) {
    status = {
      text: '即将开始',
      bgColor: 'bg-blue-500'
    };
  } else if (now > end) {
    status = {
      text: '已结束',
      bgColor: 'bg-gray-400'
    };
  }
  
  return (
    <span className={`${status.bgColor} px-3 py-1 rounded-full text-sm`}>
      {status.text}
    </span>
  );
};

const ActivityInfo = ({ data }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  
  if (!data) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      {/* 活动标题与状态 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">{data.title}</h2>
        <StatusBadge startTime={data.startTime} endTime={data.endTime} />
      </div>
      
      {/* 活动时间信息 */}
      <div className="bg-[#1a1f26] rounded-lg p-6 mb-8">
        <div className="text-gray-400 mb-2">活动时间</div>
        <div className="flex items-center space-x-4">
          <span>{data.startTime}</span>
          <span>至</span>
          <span>{data.endTime}</span>
        </div>
      </div>

      {/* 优惠信息板块 */}
      <div className="bg-[#1a1f26] rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">优惠详情</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.discounts?.map((discount, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-[#252a31] p-4 rounded-lg"
            >
              <div className="text-2xl font-bold text-yellow-500 mb-2">
                {discount.value}
              </div>
              <div className="text-gray-400 text-sm">
                {discount.description}
              </div>
              {discount.code && (
                <div className="mt-3 p-2 bg-[#1a1f26] rounded flex justify-between items-center">
                  <span className="text-yellow-500">{discount.code}</span>
                  <button 
                    onClick={() => navigator.clipboard.writeText(discount.code)}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    复制
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* 参与条件 */}
      {data.conditions && (
        <div className="bg-[#1a1f26] rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">参与条件</h3>
          <div className="space-y-3">
            {data.conditions.map((condition, index) => (
              <div 
                key={index}
                className="flex items-start space-x-2"
              >
                <span className="text-yellow-500">•</span>
                <span className="text-gray-300">{condition}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 活动说明 */}
      {data.description && (
        <div className="bg-[#1a1f26] rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">活动说明</h3>
          <div className="text-gray-300 whitespace-pre-line">
            {data.description}
          </div>
        </div>
      )}

      {/* 活动标签 */}
      {data.tags && (
        <div className="flex flex-wrap gap-2">
          {data.tags.map((tag, index) => (
            <Tooltip key={index} content={`查看更多${tag}相关活动`}>
              <span className="px-3 py-1 bg-[#252a31] rounded-full text-sm cursor-pointer hover:bg-[#2a3038] transition-colors">
                {tag}
              </span>
            </Tooltip>
          ))}
        </div>
      )}
    </motion.section>
  );
};

export default ActivityInfo;