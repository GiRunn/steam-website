import React from 'react';

const WaveBackground: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
    <svg className="absolute w-full h-full" viewBox="0 0 1200 500">
      <defs>
        <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <path
        d="M 0 100 Q 300 150 600 100 Q 900 50 1200 100 L 1200 500 L 0 500 Z"
        fill="url(#wave-gradient)"
        className="animate-wave-slow"
      />
      <path
        d="M 0 150 Q 300 200 600 150 Q 900 100 1200 150 L 1200 500 L 0 500 Z"
        fill="url(#wave-gradient)"
        className="animate-wave-fast"
      />
    </svg>
  </div>
);

export default WaveBackground;