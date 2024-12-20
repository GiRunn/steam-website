import React from 'react';
import './Alert.css';

interface AlertProps {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
}

const Alert: React.FC<AlertProps> = ({ type, message }) => {
  return (
    <div className={`alert alert-${type}`}>
      {message}
    </div>
  );
};

export default Alert; 