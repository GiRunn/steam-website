// src/pages/store/activity-detail/components/ActivityInfo/index.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip } from '../../../../../components/ui/Tooltip';
import styles from './styles.module.css';

// 优化状态计算逻辑，使用useMemo避免重复计算
const StatusBadge = ({ startTime, endTime }) => {
  const { statusClass, text } = useMemo(() => {
    const now = new Date().getTime();
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    
    if (now < start) {
      return {
        statusClass: `${styles.statusBadge} ${styles.upcoming}`,
        text: '即将开始'
      };
    } else if (now > end) {
      return {
        statusClass: `${styles.statusBadge} ${styles.ended}`,
        text: '已结束'
      };
    }
    return {
      statusClass: `${styles.statusBadge} ${styles.active}`,
      text: '进行中'
    };
  }, [startTime, endTime]);
  
  return (
    <motion.span 
      className={statusClass}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {text}
    </motion.span>
  );
};

const ActivityInfo = ({ data }) => {
  const [copiedCode, setCopiedCode] = useState(null);
  
  // 优化复制功能，添加反馈效果
  const handleCopyCode = useCallback(async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-500"
        >
          数据加载中...
        </motion.div>
      </div>
    );
  }

  // 容器动画配置
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`${styles.container} mb-12 overflow-hidden`}
    >
      {/* 活动标题与状态 */}
      <motion.div 
        className="flex justify-between items-center mb-6"
        variants={containerVariants}
      >
        <h1 className={`${styles.title} text-2xl font-bold`}>{data.title}</h1>
        <StatusBadge startTime={data.startTime} endTime={data.endTime} />
      </motion.div>
      
      {/* 活动时间信息 */}
      <motion.div 
        className={`${styles.activityCard} mb-6 p-6 rounded-lg shadow-md bg-white`}
        variants={containerVariants}
      >
        <div className={`${styles.timeInfo} text-lg font-medium mb-2`}>活动时间</div>
        <div className={`${styles.timeRange} flex items-center gap-3 text-gray-600`}>
          <span>{data.startTime}</span>
          <span className="text-gray-400">至</span>
          <span>{data.endTime}</span>
        </div>
      </motion.div>

      {/* 优惠信息板块 */}
      <motion.div 
        className={`${styles.activityCard} mb-6 p-6 rounded-lg shadow-md bg-white`}
        variants={containerVariants}
      >
        <h2 className={`${styles.title} text-xl font-bold mb-4`}>优惠详情</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {data.discounts?.map((discount, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02 }}
                className={`${styles.discountCard} p-4 rounded-lg bg-gray-50 hover:shadow-lg transition-shadow`}
              >
                <div className={`${styles.discountValue} text-xl font-bold text-primary mb-2`}>
                  {discount.value}
                </div>
                <div className={`${styles.discountDescription} text-gray-600 mb-3`}>
                  {discount.description}
                </div>
                {discount.code && (
                  <div className={`${styles.codeContainer} flex items-center gap-2`}>
                    <code className={`${styles.code} px-3 py-1 bg-gray-100 rounded`}>
                      {discount.code}
                    </code>
                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCopyCode(discount.code)}
                      className={`${styles.copyButton} px-3 py-1 rounded bg-primary text-white hover:bg-primary-dark`}
                      aria-label="复制优惠码"
                    >
                      {copiedCode === discount.code ? '已复制' : '复制'}
                    </motion.button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* 参与条件 */}
      {data.conditions && (
        <motion.div 
          className={`${styles.activityCard} mb-6 p-6 rounded-lg shadow-md bg-white`}
          variants={containerVariants}
        >
          <h2 className={`${styles.title} text-xl font-bold mb-4`}>参与条件</h2>
          <div className={`${styles.conditionsList} space-y-2`}>
            {data.conditions.map((condition, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${styles.conditionItem} flex items-start gap-2`}
              >
                <span className={`${styles.conditionBullet} text-primary`}>•</span>
                <span className="text-gray-700">{condition}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 活动说明 */}
      {data.description && (
        <motion.div 
          className={`${styles.activityCard} mb-6 p-6 rounded-lg shadow-md bg-white`}
          variants={containerVariants}
        >
          <h2 className={`${styles.title} text-xl font-bold mb-4`}>活动说明</h2>
          <div className={`${styles.description} text-gray-700 leading-relaxed`}>
            {data.description}
          </div>
        </motion.div>
      )}

      {/* 活动标签 */}
      {data.tags && (
        <motion.div 
          className={`${styles.tagContainer} flex flex-wrap gap-2`}
          variants={containerVariants}
        >
          {data.tags.map((tag, index) => (
            <Tooltip key={index} content={`查看更多${tag}相关活动`}>
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`${styles.tag} px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer`}
              >
                {tag}
              </motion.span>
            </Tooltip>
          ))}
        </motion.div>
      )}
    </motion.section>
  );
};

export default ActivityInfo;