import React from 'react';
import './styles.css';

interface ProgressProps {
  percent: number;
  status?: 'normal' | 'exception' | 'warning';
  showInfo?: boolean;
}

const Progress: React.FC<ProgressProps> = ({
  percent,
  status = 'normal',
  showInfo = true
}) => {
  return (
    <div className="progress-wrapper">
      <div className="progress">
        <div 
          className={`progress-bar progress-bar-${status}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showInfo && (
        <span className={`progress-info progress-info-${status}`}>
          {percent}%
        </span>
      )}
    </div>
  );
};

export default Progress; 