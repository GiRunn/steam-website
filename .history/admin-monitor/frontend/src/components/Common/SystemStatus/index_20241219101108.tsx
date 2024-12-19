import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './styles.css';

export type SystemStatusType = 'healthy' | 'warning' | 'error' | 'maintenance';

interface SystemStatusProps {
  status: SystemStatusType;
  message?: string;
  details?: {
    cpu?: number;
    memory?: number;
    disk?: number;
    network?: number;
  };
}

const statusConfig = {
  healthy: {
    icon: 'check-circle',
    color: 'var(--success)',
    label: '系统正常'
  },
  warning: {
    icon: 'exclamation-triangle',
    color: 'var(--warning)',
    label: '系统警告'
  },
  error: {
    icon: 'times-circle',
    color: 'var(--danger)',
    label: '系统错误'
  },
  maintenance: {
    icon: 'tools',
    color: 'var(--info)',
    label: '系统维护'
  }
};

const SystemStatus: React.FC<SystemStatusProps> = ({
  status,
  message,
  details
}) => {
  const config = statusConfig[status];

  return (
    <motion.div 
      className={`system-status-container ${status}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="status-header">
        <motion.div 
          className="status-icon"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: status === 'error' ? [0, 15, -15, 0] : 0
          }}
          transition={{ 
            duration: 0.5,
            repeat: status === 'error' ? Infinity : 0,
            repeatDelay: 1
          }}
        >
          <i className={`fas fa-${config.icon}`} style={{ color: config.color }}></i>
        </motion.div>
        <div className="status-info">
          <h3 style={{ color: config.color }}>{config.label}</h3>
          {message && <p className="status-message">{message}</p>}
        </div>
      </div>

      <AnimatePresence>
        {details && (
          <motion.div 
            className="status-details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {Object.entries(details).map(([key, value], index) => (
              <motion.div 
                key={key}
                className="detail-item"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="detail-label">{key}</span>
                <div className="detail-value">
                  <div className="progress-bar">
                    <motion.div 
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      style={{ 
                        backgroundColor: value > 90 ? 'var(--danger)' : 
                                       value > 70 ? 'var(--warning)' : 
                                       'var(--success)'
                      }}
                    />
                  </div>
                  <span>{value}%</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SystemStatus; 