import React from 'react';

interface StatItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: number;
}

interface ServiceStatsProps {
  stats: StatItem[];
}

const ServiceStats: React.FC<ServiceStatsProps> = ({ stats }) => (
  <div className="grid grid-cols-2 gap-4 mb-4">
    {stats.map((stat, index) => (
      <div
        key={index}
        className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30"
      >
        <div className="flex items-center space-x-2 mb-2">
          {stat.icon}
          <span className="text-xs text-gray-400">{stat.label}</span>
        </div>
        <div className="text-lg font-semibold">{stat.value}</div>
        {stat.trend && (
          <div className={`text-xs ${stat.trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stat.trend > 0 ? '+' : ''}{stat.trend}%
          </div>
        )}
      </div>
    ))}
  </div>
);

export default ServiceStats;