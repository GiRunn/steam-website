import React from 'react';

interface InputDecoratorProps {
  children: React.ReactNode;
}

const InputDecorator: React.FC<InputDecoratorProps> = ({ children }) => (
  <div className="relative">
    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg blur" />
    <div className="relative bg-gray-800/30 backdrop-blur-md rounded-lg border border-gray-700/30">
      {children}
    </div>
  </div>
);

export default InputDecorator;