import React from 'react';
import './Badge.css';

interface BadgeProps {
  status?: 'success' | 'processing' | 'error' | 'warning' | 'default';
  text?: string;
  count?: number;
  dot?: boolean;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  status = 'default',
  text,
  count,
  dot = false,
  className = '',
}) => {
  return (
    <span className={`badge ${className}`}>
      <span className={`badge-dot badge-status-${status}`} />
      {text && <span className="badge-text">{text}</span>}
      {!dot && count !== undefined && (
        <span className={`badge-count badge-status-${status}`}>
          {count > 99 ? '99+' : count}
        </span>
      )}
    </span>
  );
};

export default Badge; 