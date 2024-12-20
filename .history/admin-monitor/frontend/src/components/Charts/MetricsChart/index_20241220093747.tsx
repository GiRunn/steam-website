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

interface ChartProps {
  data: Array<{ timestamp: string; value: number }>;
  title: string;
  color?: string;
  height?: number;
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
}

function MetricsChart(props: ChartProps) {
  const { 
    data, 
    title, 
    color = '#1890ff', 
    height = 300, 
    timeRange, 
    onTimeRangeChange 
  } = props;

  return (
    <div className="metrics-chart">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        {timeRange && onTimeRangeChange && (
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
        )}
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} domain={[0, 'auto']} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #d9d9d9',
                borderRadius: '4px'
              }}
            />
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
}

export type { ChartProps as MetricsChartProps };
export default React.memo(MetricsChart); 