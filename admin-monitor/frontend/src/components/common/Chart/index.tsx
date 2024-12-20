import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './styles.css';

interface ChartProps {
  data: any[];
  xField: string;
  yField: string;
  title?: string;
  height?: number;
  color?: string;
  type?: 'line' | 'area' | 'bar';
}

const Chart: React.FC<ChartProps> = ({
  data,
  xField,
  yField,
  title,
  height = 300,
  color = '#1890ff',
  type = 'line'
}) => {
  const renderChart = () => {
    switch (type) {
      case 'line':
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey={xField} 
                stroke="#666" 
                tick={{ fill: '#666' }}
              />
              <YAxis 
                stroke="#666"
                tick={{ fill: '#666' }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(0,0,0,0.8)',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff'
                }}
              />
              <Line 
                type="monotone" 
                dataKey={yField} 
                stroke={color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="chart-wrapper">
      {title && <h3 className="chart-title">{title}</h3>}
      <div className="chart-container" style={{ height }}>
        {renderChart()}
      </div>
    </div>
  );
};

export default Chart; 