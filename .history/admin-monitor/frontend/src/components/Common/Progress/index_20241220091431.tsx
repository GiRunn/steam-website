import React from 'react';
import './Progress.css';

interface ProgressProps {
  percent: number;
  status?: 'normal' | 'exception' | 'success';
  showInfo?: boolean;
}

const Progress: React.FC<ProgressProps> = ({
  percent,
  status = 'normal',
  showInfo = true
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'exception':
        return '#ff4d4f';
      case 'success':
        return '#52c41a';
      default:
        return '#1890ff';
    }
  };

  return (
    <div className="progress">
      <div className="progress-outer">
        <div
          className="progress-inner"
          style={{
            width: `${percent}%`,
            backgroundColor: getStatusColor()
          }}
        />
      </div>
      {showInfo && (
        <span className="progress-info" style={{ color: getStatusColor() }}>
          {percent}%
        </span>
      )}
    </div>
  );
};

export default Progress; 