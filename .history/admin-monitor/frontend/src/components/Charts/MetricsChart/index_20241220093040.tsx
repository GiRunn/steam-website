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
import './MetricsChart.css';

interface DataPoint {
  timestamp: string;
  value: number;
}

interface MetricsChartProps {
  data: DataPoint[];
  chartTitle?: string;
  color?: string;
  height?: number;
}

const MetricsChart: React.FC<MetricsChartProps> = ({
  data,
  chartTitle,
  color = '#1890ff',
  height = 300
}) => {
  return (
    <div className="metrics-chart">
      {chartTitle && <h3 className="chart-title">{chartTitle}</h3>}
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="timestamp" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              domain={[0, 'auto']}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MetricsChart; 