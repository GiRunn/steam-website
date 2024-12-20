import { FC } from 'react';

interface ChartProps {
  data: any[];
  xField: string;
  yField: string;
  title?: string;
  height?: number;
  color?: string;
  type?: 'line' | 'area' | 'bar';
}

declare const Chart: FC<ChartProps>;
export default Chart; 