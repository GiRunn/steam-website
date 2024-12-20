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
  [key: string]: any;
}

interface MetricsChartProps {
  data: DataPoint[];
  title?: string;
  color?: string;
  dataKey?: string;
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
  height?: number;
  type?: 'line' | 'area';
}

const MetricsChart: React.FC<MetricsChartProps> = ({
  data,
  title,
  color = '#1890ff',
  dataKey = 'value',
  height = 300,
  type = 'line',
  timeRange,
  onTimeRangeChange
}) => {
  return (
    <div className="metrics-chart">
      {title && <h3 className="chart-title">{title}</h3>}
      {timeRange && onTimeRangeChange && (
        <div className="chart-controls">
          <select 
            value={timeRange} 
            onChange={(e) => onTimeRangeChange(e.target.value)}
            className="time-range-select"
          >
            <option value="1h">最近1小时</option>
            <option value="6h">最近6小时</option>
            <option value="24h">最近24小时</option>
            <option value="7d">最近7天</option>
            <option value="30d">最近30天</option>
          </select>
        </div>
      )}
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
              dataKey={dataKey}
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