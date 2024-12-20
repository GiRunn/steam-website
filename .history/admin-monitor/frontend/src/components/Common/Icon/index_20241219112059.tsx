import React from 'react';
import './styles.css';

interface IconProps {
  type: string;
  className?: string;
  spin?: boolean;
  size?: 'sm' | 'lg' | 'xl';
}

const Icon: React.FC<IconProps> = ({ 
  type, 
  className = '', 
  spin = false,
  size
}) => {
  const classes = [
    'icon',
    `icon-${type}`,
    spin && 'icon-spin',
    size && `icon-${size}`,
    className
  ].filter(Boolean).join(' ');

  return <i className={classes} />;
};

export default Icon; 