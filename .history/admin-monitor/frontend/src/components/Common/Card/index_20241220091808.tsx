import React from 'react';
import './Card.css';

interface CardProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  extra?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ 
  title, 
  children, 
  className = '', 
  extra 
}) => {
  return (
    <div className={`card ${className}`}>
      {(title || extra) && (
        <div className="card-header">
          {title && <div className="card-title">{title}</div>}
          {extra && <div className="card-extra">{extra}</div>}
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default Card; 