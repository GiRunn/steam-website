import React from 'react';
import { motion } from 'framer-motion';
import './styles.css';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  trend?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'var(--accent-primary)'
}) => {
  return (
    <motion.div 
      className="stat-card glass-effect"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="stat-header">
        <div className="stat-icon" style={{ color }}>
          <i className={icon}></i>
        </div>
        <h3>{title}</h3>
      </div>
      
      <div className="stat-content">
        <div className="stat-value" style={{ color }}>
          {value}
        </div>
        {trend && (
          <div className={`stat-trend ${trend.type}`}>
            <i className={`fas fa-arrow-${trend.type === 'increase' ? 'up' : 'down'}`}></i>
            {trend.value}%
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard; 