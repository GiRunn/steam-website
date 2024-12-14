// src/pages/store/activity-detail/components/ActivityInfo/index.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from '@/components/ui/Tooltip';
import styles from './styles.module.css';

const ActivityInfo = ({ data }) => {
  if (!data) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      <h2 className="text-3xl font-bold mb-6">{data.title}</h2>
      
      {/* 基本信息卡片 */}
      <div className="bg-[#1a1f26] rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">活动信息</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-gray-400 w-20">日期：</span>
                <span>{data.date}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-400 w-20">地点：</span>
                <span>{data.location}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-400 w-20">人数：</span>
                <span>{data.capacity}人</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">票价信息</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-[#252a31] p-3 rounded">
                <span>普通票</span>
                <span className="text-xl font-bold text-yellow-500">
                  ¥{data.price.regular}
                </span>
              </div>
              <div className="flex items-center justify-between bg-[#252a31] p-3 rounded">
                <span>VIP票</span>
                <span className="text-xl font-bold text-yellow-500">
                  ¥{data.price.vip}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 活动亮点 */}
      <div className="bg-[#1a1f26] rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">活动亮点</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.highlights.map((highlight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-[#252a31] p-4 rounded-lg text-center"
            >
              {highlight}
            </motion.div>
          ))}
        </div>
      </div>

      {/* 活动标签 */}
      <div className="flex flex-wrap gap-2">
        {data.tags.map((tag, index) => (
          <Tooltip key={index} content={`查看更多${tag}相关活动`}>
            <span className="px-3 py-1 bg-[#252a31] rounded-full text-sm cursor-pointer hover:bg-[#2a3038] transition-colors">
              {tag}
            </span>
          </Tooltip>
        ))}
      </div>
    </motion.section>
  );
};

export default ActivityInfo;