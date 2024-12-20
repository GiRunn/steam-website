import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import './styles.css';

interface ChartProps {
  type: 'line';
  data: any[];
  xField: string;
  yField: string;
  title?: string;
}

const Chart: React.FC<ChartProps> = ({ type, data, xField, yField, title }) => {
  return (
    <div className="chart-wrapper">
      {title && <h3 className="chart-title">{title}</h3>}
      <div className="chart-container">
        <LineChart width={600} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xField} />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey={yField} stroke="#8884d8" />
        </LineChart>
      </div>
    </div>
  );
};

export default Chart; 