import React from 'react';
import './Card.css';

interface CardProps {
  title: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">{title}</h2>
      </div>
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default Card; 