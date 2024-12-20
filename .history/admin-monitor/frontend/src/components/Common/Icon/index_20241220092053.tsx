import React from 'react';
import './Icon.css';

interface IconProps {
  type: string;
  className?: string;
  spin?: boolean;
  onClick?: () => void;
}

const Icon: React.FC<IconProps> = ({
  type,
  className = '',
  spin = false,
  onClick,
}) => {
  const getIconClass = () => {
    const classes = ['icon', `icon-${type}`];
    if (spin) classes.push('icon-spin');
    if (className) classes.push(className);
    return classes.join(' ');
  };

  return (
    <span 
      className={getIconClass()} 
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    />
  );
};

export default Icon; 