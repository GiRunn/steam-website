// src/pages/store/activity-detail/components/Schedule/index.jsx
import React from 'react';
import { motion } from 'framer-motion';
import styles from './styles.module.css';

const Schedule = ({ data }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      <h2 className="text-3xl font-bold mb-6">活动日程</h2>
      
      <div className="relative">
        {/* 时间线 */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-blue-600 md:left-1/2"></div>
        
        {/* 日程项目 */}
        <div className="space-y-8">
          {data.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative ${styles.scheduleItem} ${
                index % 2 === 0 ? 'md:pr-1/2' : 'md:pl-1/2 md:ml-auto'
              }`}
            >
              {/* 时间点 */}
              <div className={`
                absolute left-[-8px] md:left-1/2 top-0 w-4 h-4 
                bg-blue-600 rounded-full border-4 border-[#0a0f16]
                ${index % 2 === 0 ? 'md:translate-x-[-50%]' : 'md:translate-x-[-50%]'}
              `}/>
              
              {/* 内容卡片 */}
              <div className={`
                bg-[#1a1f26] p-6 rounded-lg ml-6 md:ml-0
                ${styles.scheduleCard}
                ${index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'}
              `}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <span className="text-blue-400 font-mono">{item.time}</span>
                </div>
                <p className="text-gray-400">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default Schedule;