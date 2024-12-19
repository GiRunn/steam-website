import React from 'react';
import { motion } from 'framer-motion';
import './styles.css';

export interface PerformanceDetailsProps {
  data: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    network_throughput: number;
    active_connections: number;
    response_time: number;
  };
}

const PerformanceDetails: React.FC<PerformanceDetailsProps> = ({ data }) => {
  return (
    <div className="performance-details">
      <h2>性能详情</h2>
      <div className="metrics-grid">
        <motion.div 
          className="metric-card"
          whileHover={{ scale: 1.02 }}
        >
          <h3>CPU使用率</h3>
          <p>{data.cpu_usage.toFixed(2)}%</p>
        </motion.div>
        <motion.div 
          className="metric-card"
          whileHover={{ scale: 1.02 }}
        >
          <h3>内存使用率</h3>
          <p>{data.memory_usage.toFixed(2)}%</p>
        </motion.div>
        {/* 其他指标卡片 */}
      </div>
    </div>
  );
};

export default PerformanceDetails; 