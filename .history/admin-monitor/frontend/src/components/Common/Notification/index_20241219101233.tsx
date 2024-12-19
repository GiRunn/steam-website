import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './styles.css';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationProps {
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  onClose: () => void;
}

const notificationConfig = {
  success: {
    icon: 'check-circle',
    color: 'var(--success)'
  },
  error: {
    icon: 'times-circle',
    color: 'var(--danger)'
  },
  warning: {
    icon: 'exclamation-triangle',
    color: 'var(--warning)'
  },
  info: {
    icon: 'info-circle',
    color: 'var(--info)'
  }
};

const Notification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  duration = 4000,
  onClose
}) => {
  const config = notificationConfig[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <motion.div
      className={`notification ${type}`}
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      layout
    >
      <div className="notification-icon" style={{ color: config.color }}>
        <i className={`fas fa-${config.icon}`}></i>
      </div>
      
      <div className="notification-content">
        <h4>{title}</h4>
        <p>{message}</p>
      </div>
      
      <motion.button
        className="close-button"
        onClick={onClose}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <i className="fas fa-times"></i>
      </motion.button>

      {duration > 0 && (
        <motion.div 
          className="progress-bar"
          initial={{ width: '100%' }}
          animate={{ width: 0 }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          style={{ backgroundColor: config.color }}
        />
      )}
    </motion.div>
  );
};

export default Notification; 