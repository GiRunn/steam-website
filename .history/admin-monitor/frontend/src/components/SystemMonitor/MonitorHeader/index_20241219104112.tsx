import React from 'react';
import { motion } from 'framer-motion';
import './styles.css';

interface MonitorHeaderProps {
  refreshInterval: number;
  isAutoRefresh: boolean;
  lastUpdated: Date | null;
  onRefreshIntervalChange: (interval: number) => void;
  onAutoRefreshChange: (isAuto: boolean) => void;
}

export const MonitorHeader: React.FC<MonitorHeaderProps> = ({
  refreshInterval,
  isAutoRefresh,
  lastUpdated,
  onRefreshIntervalChange,
  onAutoRefreshChange
}) => {
  return (
    <motion.header 
      className="monitor-header glass-effect"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header content */}
    </motion.header>
  );
}; 