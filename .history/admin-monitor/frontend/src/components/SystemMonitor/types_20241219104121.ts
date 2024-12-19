export interface Metric {
  name: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface MetricsHistory {
  cpu: Array<{ timestamp: string; value: number }>;
  memory: Array<{ timestamp: string; value: number }>;
  connections: Array<{ timestamp: string; value: number }>;
  transactions: Array<{ timestamp: string; value: number }>;
}

// Other type definitions... 