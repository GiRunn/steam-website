// src/pages/store/activity-detail/components/Schedule/index.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, Clock, Zap, Star, Gift, TrendingUp } from 'lucide-react';
import styles from './styles.module.css';

const Schedule = ({ data = [] }) => {  // 设置默认值为空数组
  // 如果没有数据，显示空状态
  if (!data || data.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.container}
      >
        <h2 className={styles.title}>
          <CalendarClock className="w-6 h-6 mr-2" />
          活动阶段
        </h2>
        <div className={styles.emptyState}>
          <p>暂无活动阶段信息</p>
        </div>
      </motion.section>
    );
  }

  // 根据阶段类型返回对应的图标
  const getPhaseIcon = (type) => {
    switch (type) {
      case 'pre':
        return <Clock className="w-5 h-5" />;
      case 'peak':
        return <Zap className="w-5 h-5" />;
      case 'normal':
        return <Star className="w-5 h-5" />;
      case 'extra':
        return <Gift className="w-5 h-5" />;
      case 'final':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <CalendarClock className="w-5 h-5" />;
    }
  };

  // 判断阶段是否激活
  const isPhaseActive = (startTime, endTime) => {
    if (!startTime || !endTime) return false;
    
    try {
      const now = new Date().getTime();
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();
      return now >= start && now <= end;
    } catch (error) {
      console.error('Date parsing error:', error);
      return false;
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={styles.container}
    >
      <h2 className={styles.title}>
        <CalendarClock className="w-6 h-6 mr-2" />
        活动阶段
      </h2>
      
      <div className={styles.timeline}>
        <div className={styles.timelineBar} />
        
        <div className={styles.phaseContainer}>
          {data.map((phase, index) => {
            const isActive = isPhaseActive(phase.startTime, phase.endTime);
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={styles.phaseItem}
              >
                <div className={`${styles.timePoint} ${isActive ? styles.activePoint : ''}`}>
                  {getPhaseIcon(phase.type)}
                </div>
                
                <div className={`${styles.phaseCard} ${isActive ? styles.activeCard : ''}`}>
                  <div className={styles.phaseHeader}>
                    <h3 className={styles.phaseTitle}>{phase.title || '未命名阶段'}</h3>
                    <span className={styles.phaseTime}>
                      {phase.startTime && new Date(phase.startTime).toLocaleDateString()} 
                      {phase.startTime && phase.endTime && ' - '} 
                      {phase.endTime && new Date(phase.endTime).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* 优惠信息 */}
                  {phase.benefits && phase.benefits.length > 0 && (
                    <div className={styles.benefitsContainer}>
                      {phase.benefits.map((benefit, idx) => (
                        <div key={idx} className={styles.benefitItem}>
                          <span className={styles.benefitValue}>
                            {benefit.value || '暂无优惠'}
                          </span>
                          <span className={styles.benefitDesc}>
                            {benefit.description || '暂无说明'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 额外说明 */}
                  {phase.notice && (
                    <div className={styles.noticeBox}>
                      <p className={styles.noticeText}>{phase.notice}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};

export default Schedule;