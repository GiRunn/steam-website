import React from 'react';
import { Icon } from '..';
import './styles.css';

interface AlertProps {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  showIcon?: boolean;
  closable?: boolean;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({
  type,
  message,
  showIcon = true,
  closable = false,
  onClose
}) => {
  return (
    <div className={`alert alert-${type}`}>
      {showIcon && <Icon type={type} className="alert-icon" />}
      <span className="alert-message">{message}</span>
      {closable && (
        <Icon 
          type="close" 
          className="alert-close" 
          onClick={onClose}
        />
      )}
    </div>
  );
};

export default Alert; 