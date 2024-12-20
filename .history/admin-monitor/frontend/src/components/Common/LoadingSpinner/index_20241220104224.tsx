import React from 'react';
import './styles.css';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-spinner-container" role="status" aria-label="加载中">
      <div className="loading-spinner">
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
      </div>
      <span className="loading-text">加载中...</span>
    </div>
  );
};

export default LoadingSpinner; 