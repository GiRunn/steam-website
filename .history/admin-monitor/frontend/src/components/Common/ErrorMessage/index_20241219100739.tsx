import React from 'react';
import { motion } from 'framer-motion';
import './styles.css';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <motion.div 
      className="error-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="error-icon">
        <i className="fas fa-exclamation-circle"></i>
      </div>
      <div className="error-content">
        <h4>出错了</h4>
        <p>{message}</p>
      </div>
      {onRetry && (
        <motion.button 
          className="retry-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
        >
          重试
        </motion.button>
      )}
    </motion.div>
  );
};

export default ErrorMessage; 