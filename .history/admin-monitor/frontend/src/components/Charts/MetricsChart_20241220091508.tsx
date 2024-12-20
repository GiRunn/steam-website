import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface MetricsChartProps {
  data: {
    timestamp: string;
    value: number;
  }[];
}

const MetricsChart: React.FC<MetricsChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
        <XAxis
          dataKey="timestamp"
          stroke="#8c8c8c"
          tick={{ fill: '#8c8c8c' }}
        />
        <YAxis stroke="#8c8c8c" tick={{ fill: '#8c8c8c' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            color: '#ffffff'
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#1890ff"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#1890ff' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MetricsChart; 