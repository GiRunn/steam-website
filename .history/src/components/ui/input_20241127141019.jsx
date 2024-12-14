// src/components/ui/input.jsx
import React from 'react';

export const Input = React.forwardRef(({ 
  className = '',
  type = 'text',
  ...props 
}, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={`w-full px-3 py-2 rounded-md border bg-transparent
        focus:outline-none focus:ring-2 focus:ring-blue-500
        ${className}`}
      {...props}
    />
  );
});