import React from 'react';
import { motion } from 'framer-motion';
import { PerformanceDetails as PerformanceDetailsType } from '../../../types';
import './styles.css';

interface PerformanceDetailsProps {
  data: PerformanceDetailsType;
}

const PerformanceDetails: React.FC<PerformanceDetailsProps> = ({ data }) => {
  return (
    <motion.div 
      className="performance-details glass-effect"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
    >
      <motion.h3 
        className="section-title"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5 }}
      >
        性能详情
      </motion.h3>
      
      <div className="performance-grid">
        <motion.div 
          className="performance-card"
          whileHover={{ scale: 1.05 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="card-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="card-content">
            <span className="card-label">平均查询时间</span>
            <span className="card-value">
              {data.query_performance.avg_query_time.toFixed(2)}ms
            </span>
          </div>
        </motion.div>

        {/* Add more performance cards here */}
      </div>
      
      <motion.div 
        className="connection-stats"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <h4>连接状态分布</h4>
        <div className="stats-grid">
          {/* Add connection stats visualization */}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PerformanceDetails; 