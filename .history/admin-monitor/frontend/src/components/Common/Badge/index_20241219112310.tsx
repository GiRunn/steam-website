import React from 'react';
import './styles.css';

interface BadgeProps {
  status: 'success' | 'error' | 'warning' | 'info' | 'default';
  text: string;
}

const Badge: React.FC<BadgeProps> = ({ status, text }) => {
  return (
    <span className={`badge badge-${status}`}>
      <span className={`badge-dot badge-dot-${status}`} />
      <span className="badge-text">{text}</span>
    </span>
  );
};

export default Badge; 