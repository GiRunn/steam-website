import React from 'react';
import { motion } from 'framer-motion';
import './styles.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  color = 'var(--accent-primary)'
}) => {
  return (
    <div className={`loading-container ${size}`}>
      <motion.div 
        className="loading-spinner"
        style={{ borderTopColor: color }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <motion.div 
        className="loading-text"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        加载中...
      </motion.div>
    </div>
  );
};

export default LoadingSpinner; 