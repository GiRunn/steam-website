import React from 'react';

const BackgroundEffect: React.FC = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-purple-900/10" />
    <div className="absolute top-0 left-0 w-full h-full">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full mix-blend-screen filter blur-xl animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 200 + 50}px`,
            height: `${Math.random() * 200 + 50}px`,
            background: `radial-gradient(circle, rgba(${Math.random() * 100 + 100}, ${
              Math.random() * 100 + 100
            }, 255, 0.1) 0%, rgba(0,0,0,0) 70%)`,
            animation: `float ${Math.random() * 10 + 20}s linear infinite`,
          }}
        />
      ))}
    </div>
  </div>
);

export default BackgroundEffect;