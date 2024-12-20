import React from 'react';
import './styles.css';

interface IconProps {
  type: string;
}

const Icon: React.FC<IconProps> = ({ type }) => {
  return (
    <i className={`icon icon-${type}`} />
  );
};

export default Icon; 