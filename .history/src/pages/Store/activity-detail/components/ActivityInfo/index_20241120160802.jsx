// src/pages/store/activity-detail/components/ActivityInfo/index.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from '../../../../../components/ui/Tooltip';
import styles from './styles.module.css';

// 状态徽章保持不变,因为这个设计已经不错了
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
  const [activeDiscount, setActiveDiscount] = useState(null);
  
  if (!data) return null;

  return (
    <div className={styles.activityContainer}>
      {/* 标题部分保持不变 */}
      <div className="flex justify-between items-center mb-8">
        <h2 className={styles.title}>{data.title}</h2>
        <StatusBadge startTime={data.startTime} endTime={data.endTime} />
      </div>
      
      {/* 重新设计的活动时间模块 */}
      <motion.div 
        className={styles.timeBlock}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.timeHeader}>
          <span className={styles.timeIcon}>⏰</span>
          <h3>活动时间</h3>
        </div>
        <motion.div 
          className={styles.timeContent}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className={styles.timeRange}>
            <motion.span 
              whileHover={{ color: "#1a73e8" }}
              className={styles.timePoint}
            >
              {data.startTime}
            </motion.span>
            <motion.div 
              className={styles.timeLine}
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5 }}
            />
            <motion.span 
              whileHover={{ color: "#1a73e8" }}
              className={styles.timePoint}
            >
              {data.endTime}
            </motion.span>
          </div>
        </motion.div>
      </motion.div>

      {/* 重新设计的优惠详情模块 */}
      <div className={styles.discountSection}>
        <h3 className={styles.sectionTitle}>优惠详情</h3>
        <div className={styles.discountGrid}>
          {data.discounts?.map((discount, index) => (
            <motion.div
              key={index}
              className={styles.discountCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setActiveDiscount(activeDiscount === index ? null : index)}
            >
              <div className={styles.discountMain}>
                <div className={styles.discountValue}>{discount.value}</div>
                {discount.code && (
                  <div className={styles.codeWrapper}>
                    <span className={styles.code}>{discount.code}</span>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className={styles.copyBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(discount.code);
                      }}
                    >
                      复制
                    </motion.button>
                  </div>
                )}
              </div>
              <motion.div
                className={styles.discountDetails}
                initial={{ height: 0 }}
                animate={{ height: activeDiscount === index ? "auto" : 0 }}
                transition={{ duration: 0.3 }}
              >
                <p>{discount.description}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 重新设计的活动说明模块 */}
      {data.description && (
        <div className={styles.descriptionSection}>
          <h3 className={styles.sectionTitle}>活动说明</h3>
          <motion.div 
            className={styles.descriptionCard}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.descriptionContent}>
              {data.description}
            </div>
            {data.conditions && (
              <div className={styles.conditionsList}>
                <h4>参与条件</h4>
                {data.conditions.map((condition, index) => (
                  <motion.div 
                    key={index}
                    className={styles.conditionItem}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className={styles.bulletPoint}>•</span>
                    {condition}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* 标签部分保持不变 */}
      {data.tags && (
        <div className={styles.tagContainer}>
          {data.tags.map((tag, index) => (
            <Tooltip key={index} content={`查看更多${tag}相关活动`}>
              <span className={styles.tag}>{tag}</span>
            </Tooltip>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityInfo;