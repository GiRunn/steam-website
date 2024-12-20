import React from 'react';
import './styles.css';

interface BadgeProps {
  status: 'success' | 'error' | 'warning' | 'info' | 'default';
  text: string;
}

const Badge: React.FC<BadgeProps> = ({ status, text }) => {
  return (
    <span className={`badge badge-${status}`}>
      {text}
    </span>
  );
};

export default Badge; 