// src/components/ui/alert.jsx
import React from 'react';

export const Alert = ({ 
  children,
  variant = 'default',
  className = ''
}) => {
  const variantClasses = {
    default: 'bg-gray-100 border-gray-200',
    destructive: 'bg-red-100 border-red-200 text-red-900',
    success: 'bg-green-100 border-green-200 text-green-900'
  };

  return (
    <div className={`p-4 rounded-md border ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

export const AlertDescription = ({ children }) => {
  return <div className="mt-1 text-sm">{children}</div>;
};