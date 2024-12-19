import React, { useState, useEffect } from 'react';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend,
    ResponsiveContainer 
} from 'recharts';
import { 
    getSystemMetrics, 
    getDatabaseMetrics,
    getConnectionStatus,
    getDatabasePerformance,
    getReviewSystemMetrics,
    getReviewSystemAnomalies,
    getPartitionStats,
    getPerformanceMetrics
} from '../services/monitorService';
import './SystemMonitor.css';

const THEME_COLORS = {
    primary: '#3498db',
    secondary: '#2ecc71',
    background: '#121212',
    card: '#1E1E1E',
    text: '#ffffff',
    accent: '#BB86FC'
};

const REFRESH_INTERVALS = [
    { label: '5秒', value: 5000 },
    { label: '10秒', value: 10000 },
    { label: '30秒', value: 30000 },
    { label: '1分钟', value: 60000 },
    { label: '5分钟', value: 300000 }
];

interface Metric {
    created_at: string;
    metric_value?: number;
    connections_total?: number;
    metric_name?: string;
}

interface ConnectionStatus {
    total_connections: number;
    active_connections: number;
    idle_connections: number;
    max_connections: number;
}

interface DatabasePerformance {
    database_name: string;
    total_transactions: number;
    transactions_per_second: number;
    cache_hit_ratio: number;
    index_hit_ratio: number;
}

// 添加接口定义
interface ReviewSystemAnomaly {
    event_type: string;
    description: string;
    severity: string;
    occurred_at: string;
}

interface PartitionStat {
    tablename: string;
    total_size: string;
}

const SystemMonitor: React.FC = () => {
    const [systemMetrics, setSystemMetrics] = useState<Metric[]>([
        { 
            created_at: new Date().toISOString(), 
            metric_value: 50.0,
            metric_name: 'CPU_USAGE'
        }
    ]);
    const [databaseMetrics, setDatabaseMetrics] = useState<Metric[]>([
        { 
            created_at: new Date().toISOString(), 
            connections_total: 10
        }
    ]);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
        total_connections: 0,
        active_connections: 0,
        idle_connections: 0,
        max_connections: 100
    });
    const [databasePerformance, setDatabasePerformance] = useState<DatabasePerformance>({
        database_name: 'games',
        total_transactions: 0,
        transactions_per_second: 0,
        cache_hit_ratio: 0,
        index_hit_ratio: 0
    });
    const [reviewSystemMetrics, setReviewSystemMetrics] = useState({
        total_reviews: 0,
        avg_rating: 0,
        reviews_last_hour: 0,
        unique_games_reviewed: 0,
        total_replies: 0,
        avg_review_length: 0
    });
    const [reviewSystemAnomalies, setReviewSystemAnomalies] = useState<ReviewSystemAnomaly[]>([]);
    const [partitionStats, setPartitionStats] = useState<PartitionStat[]>([]);
    const [performanceMetrics, setPerformanceMetrics] = useState({
        cache_hit_ratio: 0,
        transactions_per_second: 0,
        active_connections: 0,
        idle_connections: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [refreshInterval, setRefreshInterval] = useState(30000);
    const [isAutoRefresh, setIsAutoRefresh] = useState(true);

    const fetchAllMetrics = async () => {
        try {
            setIsLoading(true);
            const [
                systemData, 
                databaseData, 
                connectionData, 
                databasePerformanceData,  // 重命名
                reviewSystemData,
                anomaliesData,
                partitionData,
                performanceMetricsData  // 重命名
            ] = await Promise.all([
                getSystemMetrics(),
                getDatabaseMetrics(),
                getConnectionStatus(),
                getDatabasePerformance(),
                getReviewSystemMetrics(),
                getReviewSystemAnomalies(),
                getPartitionStats(),
                getPerformanceMetrics()
            ]);

            // 添加更多的错误检查和默认值处理
            setSystemMetrics(systemData.length > 0 ? systemData : [
                { 
                    created_at: new Date().toISOString(), 
                    metric_value: 50.0,
                    metric_name: 'CPU_USAGE'
                }
            ]);
            
            setDatabaseMetrics(databaseData.length > 0 ? databaseData : [
                { 
                    created_at: new Date().toISOString(), 
                    connections_total: 10
                }
            ]);

            setConnectionStatus(connectionData || {
                total_connections: 0,
                active_connections: 0,
                idle_connections: 0,
                max_connections: 100
            });

            setDatabasePerformance(databasePerformanceData || {
                database_name: 'games',
                total_transactions: 0,
                transactions_per_second: 0,
                cache_hit_ratio: 0,
                index_hit_ratio: 0
            });

            setReviewSystemMetrics(reviewSystemData);
            setReviewSystemAnomalies(anomaliesData);
            setPartitionStats(partitionData);
            setPerformanceMetrics(performanceMetricsData);

            setError(null);
        } catch (err: any) {
            console.error('Metrics Fetch Error:', err);
            setError(`获取指标失败: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllMetrics();
        
        let intervalId: NodeJS.Timeout;
        if (isAutoRefresh) {
            intervalId = setInterval(fetchAllMetrics, refreshInterval);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [refreshInterval, isAutoRefresh]);

    const renderMetricCard = (title: string, children: React.ReactNode, color?: string) => (
        <div 
            className="metric-card animate-fade-in"
            style={{ 
                backgroundColor: THEME_COLORS.card,
                borderLeft: `4px solid ${color || THEME_COLORS.accent}`
            }}
        >
            <h3 style={{ color: color || THEME_COLORS.accent }}>{title}</h3>
            {children}
        </div>
    );

    const renderRefreshControls = () => (
        <div className="refresh-controls">
            <div className="toggle-container">
                <label className="switch">
                    <input 
                        type="checkbox" 
                        checked={isAutoRefresh}
                        onChange={() => setIsAutoRefresh(!isAutoRefresh)}
                    />
                    <span className="slider round"></span>
                </label>
                <span>{isAutoRefresh ? '自动刷新已开启' : '自动刷新已关闭'}</span>
            </div>
            
            <div className="interval-select">
                <label>刷新间隔：</label>
                <select 
                    value={refreshInterval} 
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    disabled={!isAutoRefresh}
                >
                    {REFRESH_INTERVALS.map(interval => (
                        <option key={interval.value} value={interval.value}>
                            {interval.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );

    return (
        <div className="system-monitor-container">
            <div className="monitor-header">
                <h1>系统性能监控面板</h1>
                {renderRefreshControls()}
            </div>

            {error && (
                <div className="error-banner animate-shake">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>加载中...</p>
                </div>
            ) : (
                <>
                    <div className="metrics-grid">
                        {renderMetricCard('连接状态', (
                            <>
                                <p>总连接数: {connectionStatus.total_connections}</p>
                                <p>活跃连接: {connectionStatus.active_connections}</p>
                                <p>空闲连接: {connectionStatus.idle_connections}</p>
                                <p>最大连接数: {connectionStatus.max_connections}</p>
                            </>
                        ), THEME_COLORS.primary)}

                        {renderMetricCard('数据库性能', (
                            <>
                                <p>数据库名: {databasePerformance.database_name}</p>
                                <p>总事务数: {databasePerformance.total_transactions}</p>
                                <p>每秒事务数: {databasePerformance.transactions_per_second.toFixed(2)}</p>
                                <p>缓存命中率: {(databasePerformance.cache_hit_ratio * 100).toFixed(2)}%</p>
                            </>
                        ), THEME_COLORS.secondary)}
                    </div>

                    <div className="metrics-grid">
                        {renderMetricCard('评论系统指标', (
                            <>
                                <p>总评论数: {reviewSystemMetrics.total_reviews}</p>
                                <p>平均评分: {reviewSystemMetrics.avg_rating}</p>
                                <p>最近1小时评论数: {reviewSystemMetrics.reviews_last_hour}</p>
                                <p>独特游戏数: {reviewSystemMetrics.unique_games_reviewed}</p>
                            </>
                        ))}

                        {renderMetricCard('性能指标', (
                            <>
                                <p>缓存命中率: {performanceMetrics.cache_hit_ratio}%</p>
                                <p>每秒事务数: {performanceMetrics.transactions_per_second}</p>
                                <p>活跃连接数: {performanceMetrics.active_connections}</p>
                                <p>空闲连接数: {performanceMetrics.idle_connections}</p>
                            </>
                        ))}
                    </div>

                    <div className="metrics-grid">
                        {renderMetricCard('系统异常', (
                            reviewSystemAnomalies.map((anomaly, index) => (
                                <div key={index} className="anomaly-item">
                                    <p><strong>类型:</strong> {anomaly.event_type}</p>
                                    <p><strong>描述:</strong> {anomaly.description}</p>
                                    <p><strong>严重程度:</strong> {anomaly.severity}</p>
                                    <p><strong>发生时间:</strong> {new Date(anomaly.occurred_at).toLocaleString()}</p>
                                </div>
                            ))
                        ), 'red')}

                        {renderMetricCard('分区统计', (
                            partitionStats.map((partition, index) => (
                                <div key={index} className="partition-item">
                                    <p><strong>表名:</strong> {partition.tablename}</p>
                                    <p><strong>大小:</strong> {partition.total_size}</p>
                                </div>
                            ))
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default SystemMonitor;