export interface DataPoint {
  timestamp: string;
  value: number;
}

export interface MetricsChartProps {
  data: DataPoint[];
  title: string;
  color?: string;
  height?: number;
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
} 