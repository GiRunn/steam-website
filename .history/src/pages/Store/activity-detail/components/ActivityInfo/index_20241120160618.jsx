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
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`${styles.customScroll} mb-12`}
    >
      {/* 活动标题与状态 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className={styles.title}>{data.title}</h2>
        <StatusBadge startTime={data.startTime} endTime={data.endTime} />
      </div>
      
      {/* 活动时间信息 */}
      <div className={styles.activityCard}>
        <div className={styles.timeInfo}>活动时间</div>
        <div className={styles.timeRange}>
          <span>{data.startTime}</span>
          <span>至</span>
          <span>{data.endTime}</span>
        </div>
      </div>

      {/* 优惠信息板块 */}
      <div className={styles.activityCard}>
        <h3 className={styles.title}>优惠详情</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.discounts?.map((discount, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`${styles.discountCard} ${styles.hoverEffect}`}
            >
              <div className={styles.discountValue}>
                {discount.value}
              </div>
              <div className={styles.discountDescription}>
                {discount.description}
              </div>
              {discount.code && (
                <div className={styles.codeContainer}>
                  <span className={styles.code}>{discount.code}</span>
                  <button 
                    onClick={() => navigator.clipboard.writeText(discount.code)}
                    className={styles.copyButton}
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
        <div className={styles.activityCard}>
          <h3 className={styles.title}>参与条件</h3>
          <div className={styles.conditionsList}>
            {data.conditions.map((condition, index) => (
              <div 
                key={index}
                className={styles.conditionItem}
              >
                <span className={styles.conditionBullet}>•</span>
                <span>{condition}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 活动说明 */}
      {data.description && (
        <div className={styles.activityCard}>
          <h3 className={styles.title}>活动说明</h3>
          <div className={styles.description}>
            {data.description}
          </div>
        </div>
      )}

      {/* 活动标签 */}
      {data.tags && (
        <div className={styles.tagContainer}>
          {data.tags.map((tag, index) => (
            <Tooltip key={index} content={`查看更多${tag}相关活动`}>
              <span className={styles.tag}>
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