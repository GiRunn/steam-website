import React from 'react';
import { motion } from 'framer-motion';
import './styles.css';

interface HeaderProps {
  isAutoRefresh: boolean;
  refreshInterval: number;
  lastUpdated: Date | null;
  onAutoRefreshChange: (value: boolean) => void;
  onRefreshIntervalChange: (value: number) => void;
}

const Header: React.FC<HeaderProps> = ({
  isAutoRefresh,
  refreshInterval,
  lastUpdated,
  onAutoRefreshChange,
  onRefreshIntervalChange
}) => {
  return (
    <motion.header 
      className="monitor-header glass-effect"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="header-content">
        <motion.div 
          className="header-left"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1>系统性能监控</h1>
          <p className="subtitle">实时监控与分析</p>
        </motion.div>
        
        <motion.div 
          className="monitor-controls"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="control-group">
            <div className="auto-refresh-toggle">
              <label className="switch" htmlFor="auto-refresh-toggle">
                <input 
                  id="auto-refresh-toggle"
                  type="checkbox" 
                  checked={isAutoRefresh}
                  onChange={(e) => onAutoRefreshChange(e.target.checked)}
                  aria-label="自动刷新开关"
                />
                <motion.span 
                  className="slider"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                ></motion.span>
              </label>
              <span className="toggle-label">
                {isAutoRefresh ? '自动刷新' : '手动刷新'}
              </span>
            </div>
            
            <motion.select 
              value={refreshInterval}
              onChange={(e) => onRefreshIntervalChange(Number(e.target.value))}
              disabled={!isAutoRefresh}
              className="refresh-interval-select"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <option value="1">1秒</option>
              <option value="5">5秒</option>
              <option value="10">10秒</option>
              <option value="30">30秒</option>
              <option value="60">1分钟</option>
            </motion.select>
          </div>
          
          {lastUpdated && (
            <motion.div 
              className="last-updated"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <i className="icon-clock"></i>
              最后更新: {lastUpdated.toLocaleTimeString()}
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header; 