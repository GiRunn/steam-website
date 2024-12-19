import React from 'react';
import { motion } from 'framer-motion';
import styles from './styles.module.css';
import { Metric } from '../types';

interface MetricCardProps {
  title: string;
  metrics: Metric[];
  icon: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, metrics, icon }) => {
  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={styles.cardHeader}>
        <i className={icon} />
        <h3>{title}</h3>
      </div>
      <div className={styles.metrics}>
        {metrics.map((metric, index) => (
          <div key={index} className={styles.metricItem}>
            <div className={styles.metricInfo}>
              <span className={styles.metricName}>{metric.name}</span>
              <div className={styles.metricValue}>
                {typeof metric.value === 'number' 
                  ? metric.value.toLocaleString() 
                  : metric.value}
                {metric.unit && <span className={styles.unit}>{metric.unit}</span>}
              </div>
            </div>
            {metric.trend && (
              <motion.div 
                className={`${styles.trend} ${styles[metric.trend]}`}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default MetricCard; 