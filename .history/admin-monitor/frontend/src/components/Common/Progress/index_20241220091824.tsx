import React from 'react';
import './Progress.css';

interface ProgressProps {
  percent: number;
  status?: 'normal' | 'success' | 'warning' | 'error';
  showInfo?: boolean;
  strokeWidth?: number;
}

const Progress: React.FC<ProgressProps> = ({
  percent,
  status = 'normal',
  showInfo = true,
  strokeWidth = 8,
}) => {
  const normalizedPercent = Math.min(Math.max(0, percent), 100);

  return (
    <div className="progress">
      <div 
        className="progress-outer" 
        style={{ height: `${strokeWidth}px` }}
      >
        <div
          className={`progress-inner progress-${status}`}
          style={{ width: `${normalizedPercent}%` }}
        />
      </div>
      {showInfo && (
        <span className={`progress-info progress-${status}`}>
          {normalizedPercent}%
        </span>
      )}
    </div>
  );
};

export default Progress; 