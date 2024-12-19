import React from 'react';
import { motion } from 'framer-motion';
import { Metric } from '../types';
import './styles.css';

interface MetricCardProps {
  title: string;
  metrics: Metric[];
  icon: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, metrics, icon }) => {
  return (
    <motion.div 
      className="metric-card glass-effect"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="card-header">
        <i className={icon}></i>
        <h3>{title}</h3>
      </div>
      <div className="metric-content">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-item">
            <span className="metric-name">{metric.name}</span>
            <span className="metric-value">
              {metric.value}
              {metric.unit && <span className="metric-unit">{metric.unit}</span>}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}; 