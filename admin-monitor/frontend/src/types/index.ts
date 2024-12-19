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