// src/components/ui/button.jsx
import React from 'react';

export const Button = React.forwardRef(({ 
  className = '',
  disabled,
  children,
  ...props 
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={`px-4 py-2 rounded-md font-medium transition-colors
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});