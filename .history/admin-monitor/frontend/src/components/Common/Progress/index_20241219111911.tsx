import React from 'react';
import './styles.css';

interface ProgressProps {
  percent: number;
  status?: 'normal' | 'exception' | 'warning';
}

const Progress: React.FC<ProgressProps> = ({ percent, status = 'normal' }) => {
  return (
    <div className="progress">
      <div 
        className={`progress-bar progress-bar-${status}`}
        style={{ width: `${percent}%` }}
      >
        <span className="progress-text">{percent}%</span>
      </div>
    </div>
  );
};

export default Progress; 