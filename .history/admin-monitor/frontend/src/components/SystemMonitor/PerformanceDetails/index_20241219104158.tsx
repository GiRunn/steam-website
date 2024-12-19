import React from 'react';
import './styles.css';

interface PerformanceDetailsProps {
  details: any; // 根据实际类型定义
}

export const PerformanceDetails: React.FC<PerformanceDetailsProps> = ({ details }) => {
  return (
    <div className="performance-details">
      {/* 实现性能详情组件 */}
    </div>
  );
}; 