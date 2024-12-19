import React from 'react';
import { motion } from 'framer-motion';
import { Metric } from '../../../types';
import './styles.css';

interface MetricCardProps {
  title: string;
  metrics: Metric[];
  icon: string;
  index: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, metrics, icon, index }) => {
  return (
    <motion.div 
      className="metric-card glass-effect"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <motion.div 
        className="card-header"
        initial={{ x: -20 }}
        animate={{ x: 0 }}
        transition={{ delay: index * 0.1 + 0.2 }}
      >
        <i className={icon}></i>
        <h3>{title}</h3>
      </motion.div>
      
      <div className="metric-content">
        {metrics.map((metric, idx) => (
          <motion.div 
            key={idx} 
            className="metric-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + idx * 0.1 }}
          >
            <div className="metric-info">
              <span className="metric-name">{metric.name}</span>
              <motion.div 
                className="metric-value-container"
                whileHover={{ scale: 1.05 }}
              >
                <span className="metric-value">
                  {typeof metric.value === 'number' ? 
                    metric.value.toLocaleString() : metric.value}
                </span>
                {metric.unit && 
                  <span className="metric-unit">{metric.unit}</span>}
              </motion.div>
            </div>
            
            {metric.trend && (
              <motion.div 
                className="metric-trend"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  delay: index * 0.1 + idx * 0.1 + 0.2 
                }}
              >
                <span className={`trend-badge ${metric.trend}`}>
                  {metric.trend === 'up' ? '↑' : 
                   metric.trend === 'down' ? '↓' : '→'}
                </span>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default MetricCard; 