import React from 'react';
import './styles.css';

interface IconProps {
  type: string;
  className?: string;
  spin?: boolean;
  size?: 'small' | 'default' | 'large';
  onClick?: () => void;
}

const Icon: React.FC<IconProps> = ({
  type,
  className = '',
  spin = false,
  size = 'default',
  onClick
}) => {
  const classes = [
    'icon',
    `icon-${type}`,
    `icon-size-${size}`,
    spin && 'icon-spin',
    className
  ].filter(Boolean).join(' ');

  return (
    <span 
      className={classes}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    />
  );
};

export default Icon; 