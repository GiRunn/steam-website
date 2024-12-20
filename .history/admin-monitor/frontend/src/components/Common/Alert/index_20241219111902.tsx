import React from 'react';
import './styles.css';

interface AlertProps {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  showIcon?: boolean;
}

const Alert: React.FC<AlertProps> = ({ type, message, showIcon }) => {
  return (
    <div className={`alert alert-${type}`}>
      {showIcon && <span className={`alert-icon icon-${type}`} />}
      <span className="alert-message">{message}</span>
    </div>
  );
};

export default Alert; 