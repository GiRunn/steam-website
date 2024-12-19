import React from 'react';
import { motion } from 'framer-motion';
import './styles.css';

interface RefreshIndicatorProps {
  lastUpdated: Date | null;
  nextUpdate: Date | null;
}

const RefreshIndicator: React.FC<RefreshIndicatorProps> = ({ 
  lastUpdated, 
  nextUpdate 
}) => {
  const getTimeRemaining = () => {
    if (!nextUpdate) return null;
    const now = new Date();
    const diff = nextUpdate.getTime() - now.getTime();
    return Math.max(0, Math.floor(diff / 1000));
  };

  const timeRemaining = getTimeRemaining();

  return (
    <motion.div 
      className="refresh-indicator"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="refresh-info">
        <div className="last-update">
          <span>上次更新:</span>
          <time>{lastUpdated?.toLocaleTimeString()}</time>
        </div>
        {timeRemaining !== null && (
          <div className="next-update">
            <span>下次更新:</span>
            <motion.div 
              className="countdown"
              key={timeRemaining}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
            >
              {timeRemaining}秒
            </motion.div>
          </div>
        )}
      </div>
      <motion.div 
        className="refresh-progress"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ 
          duration: timeRemaining || 0,
          ease: "linear"
        }}
      />
    </motion.div>
  );
};

export default RefreshIndicator; 