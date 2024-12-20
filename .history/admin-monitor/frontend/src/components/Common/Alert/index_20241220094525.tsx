import React from 'react';
import './Alert.css';

interface AlertProps {
  message: React.ReactNode;
  description?: React.ReactNode;
  type?: 'success' | 'info' | 'warning' | 'error';
  showIcon?: boolean;
  closable?: boolean;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({
  message,
  description,
  type = 'info',
  showIcon = true,
  closable = false,
  onClose,
}) => {
  return (
    <div className={`alert alert-${type}`}>
      {showIcon && <span className={`alert-icon alert-icon-${type}`} />}
      <div className="alert-content">
        <div className="alert-message">{message}</div>
        {description && <div className="alert-description">{description}</div>}
      </div>
      {closable && (
        <button className="alert-close" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
};

export default Alert; 