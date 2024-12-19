export interface Metric {
  name: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface SystemMetric {
  id: number;
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  description: string;
  created_at: string;
}

export interface DatabaseMetric {
  id: number;
  database_name: string;
  connections_total: number;
  connections_active: number;
  connections_idle: number;
  cache_hit_ratio: number;
  transactions_per_second: number;
  created_at: string;
}

export interface PerformanceDetails {
  query_performance: {
    avg_query_time: number;
    cache_hit_ratio: number;
  };
  connection_stats: {
    active_connections: number;
    idle_connections: number;
    idle_in_transaction: number;
    waiting_connections: number;
  };
  query_stats: Array<{
    query: string;
    duration_ms: number;
    state: string;
    waiting: boolean;
  }>;
}

export interface MetricsHistory {
  cpu: Array<{ timestamp: string; value: number }>;
  memory: Array<{ timestamp: string; value: number }>;
  connections: Array<{ timestamp: string; value: number }>;
  transactions: Array<{ timestamp: string; value: number }>;
}

export interface OptimizationSuggestion {
  type: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
}

export interface QueryStats {
  query: string;
  duration_ms: number;
  state: string;
  waiting: boolean;
  rows_affected?: number;
  query_plan?: string;
} 