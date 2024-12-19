import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
    getSystemMetrics, 
    getDatabaseMetrics,
    getConnectionStatus,
    getReviewSystemMetrics,
    getReviewSystemAnomalies,
    getPartitionStats,
    getPerformanceMetrics,
    getDatabasePerformanceDetails,
    getOptimizationSuggestions
} from '../services/monitorService';

import './SystemMonitor.css';

// 定义指标接口
interface Metric {
    name: string;
    value: number | string;
    unit?: string;
    trend?: 'up' | 'down' | 'stable';
}

// 添加新的接口
interface PerformanceDetails {
    table_stats: Array<{
        schemaname: string;
        tablename: string;
        row_count: number;
        total_size: string;
    }>;
    index_stats: Array<{
        schemaname: string;
        tablename: string;
        indexname: string;
        index_size: string;
    }>;
    query_performance: {
        avg_query_time: number;
        max_query_time: number;
        cache_hit_ratio: number;
    };
    connection_stats: {
        total_connections: number;
        active_connections: number;
        idle_connections: number;
        waiting_connections: number;
    };
}

interface OptimizationSuggestions {
    large_tables: Array<{
        schemaname: string;
        tablename: string;
        total_size_bytes: number;
    }>;
    index_usage: Array<{
        schemaname: string;
        tablename: string;
        indexname: string;
        idx_scan: number;
    }>;
    slow_queries: Array<{
        queryid: string;
        query: string;
        avg_time_ms: number;
        calls: number;
    }>;
}

const SystemMonitor: React.FC = () => {
    const [metrics, setMetrics] = useState<{
        system: Metric[];
        database: Metric[];
        connections: Metric[];
        reviews: Metric[];
        performance: Metric[];
    }>({
        system: [],
        database: [],
        connections: [],
        reviews: [],
        performance: []
    });

    const [refreshInterval, setRefreshInterval] = useState(30);
    const [isAutoRefresh, setIsAutoRefresh] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const [performanceDetails, setPerformanceDetails] = useState<PerformanceDetails>({
        table_stats: [],
        index_stats: [],
        query_performance: {
            avg_query_time: 0,
            max_query_time: 0,
            cache_hit_ratio: 0
        },
        connection_stats: {
            total_connections: 0,
            active_connections: 0,
            idle_connections: 0,
            waiting_connections: 0
        }
    });

    const [optimizationSuggestions, setOptimizationSuggestions] = useState<OptimizationSuggestions>({
        large_tables: [],
        index_usage: [],
        slow_queries: []
    });

    const fetchMetrics = useCallback(async () => {
        try {
            const [
                systemData,
                databaseData,
                connectionData,
                reviewData,
                performanceData,
                performanceDetailsData,
                optimizationData
            ] = await Promise.all([
                getSystemMetrics(),
                getDatabaseMetrics(),
                getConnectionStatus(),
                getReviewSystemMetrics(),
                getPerformanceMetrics(),
                getDatabasePerformanceDetails(),
                getOptimizationSuggestions()
            ]);

            // 转换数据为 Metric 格式
            setMetrics({
                system: [
                    { name: 'CPU使用率', value: systemData.cpu_usage || 0, unit: '%', trend: 'stable' },
                    { name: '内存使用', value: systemData.memory_usage || 0, unit: '%', trend: 'stable' }
                ],
                database: [
                    { name: '数据库大小', value: databaseData.size || 0, unit: 'MB', trend: 'up' },
                    { name: '连接数', value: databaseData.connections || 0, trend: 'stable' }
                ],
                connections: [
                    { name: '总连接数', value: connectionData.total_connections || 0, trend: 'stable' },
                    { name: '活跃连接', value: connectionData.active_connections || 0, trend: 'stable' }
                ],
                reviews: [
                    { name: '总评论数', value: reviewData.total_reviews || 0, trend: 'up' },
                    { name: '平均评分', value: reviewData.avg_rating || 0, unit: '分', trend: 'stable' }
                ],
                performance: [
                    { name: '缓存命中率', value: performanceData.cache_hit_ratio || 0, unit: '%', trend: 'stable' },
                    { name: '每秒事务', value: performanceData.transactions_per_second || 0, trend: 'stable' }
                ]
            });

            // 设置新的性能详情和优化建议
            setPerformanceDetails(performanceDetailsData);
            setOptimizationSuggestions(optimizationData);

            setLastUpdated(new Date());
        } catch (error) {
            console.error('获取指标失败', error);
        }
    }, []);

    useEffect(() => {
        fetchMetrics();
        
        let intervalId: NodeJS.Timeout;
        if (isAutoRefresh) {
            intervalId = setInterval(fetchMetrics, refreshInterval * 1000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [fetchMetrics, isAutoRefresh, refreshInterval]);

    const renderMetricCard = (title: string, metrics: Metric[]) => (
        <motion.div 
            key={title}
            className="metric-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <h3>{title}</h3>
            {metrics.map((metric, index) => (
                <div key={index} className="metric-item">
                    <span>{metric.name}</span>
                    <div className="metric-value">
                        {metric.value}{metric.unit && ` ${metric.unit}`}
                        {metric.trend === 'up' && <span className="trend-up">↑</span>}
                        {metric.trend === 'down' && <span className="trend-down">↓</span>}
                    </div>
                </div>
            ))}
        </motion.div>
    );

    const renderPerformanceDetails = () => (
        <motion.div 
            key="performance-details"
            className="metric-card performance-details"
        >
            <h3>性能详情</h3>
            <div className="performance-section">
                <h4>查询性能</h4>
                <p>平均查询时间: {performanceDetails.query_performance.avg_query_time} ms</p>
                <p>最大查询时间: {performanceDetails.query_performance.max_query_time} ms</p>
                <p>缓存命中率: {performanceDetails.query_performance.cache_hit_ratio}%</p>
            </div>
            <div className="performance-section">
                <h4>连接状态</h4>
                <p>总连接数: {performanceDetails.connection_stats.total_connections}</p>
                <p>活跃连接: {performanceDetails.connection_stats.active_connections}</p>
                <p>空闲连接: {performanceDetails.connection_stats.idle_connections}</p>
                <p>等待连接: {performanceDetails.connection_stats.waiting_connections}</p>
            </div>
        </motion.div>
    );

    const renderOptimizationSuggestions = () => (
        <motion.div 
            key="optimization-suggestions"
            className="metric-card optimization-suggestions"
        >
            <h3>优化建议</h3>
            <div className="performance-section">
                <h4>大表列表</h4>
                {optimizationSuggestions.large_tables.map((table, index) => (
                    <p key={index}>
                        {table.schemaname}.{table.tablename}: 
                        {(table.total_size_bytes / 1024 / 1024).toFixed(2)} MB
                    </p>
                ))}
            </div>
            <div className="performance-section">
                <h4>慢查询</h4>
                {optimizationSuggestions.slow_queries.map((query, index) => (
                    <p key={index}>
                        平均耗时: {query.avg_time_ms} ms, 
                        调用次数: {query.calls}
                    </p>
                ))}
            </div>
        </motion.div>
    );

    return (
        <div className="system-monitor">
            <header className="monitor-header">
                <h1>系统性能监控</h1>
                <div className="monitor-controls">
                    <div className="auto-refresh-toggle">
                        <label className="switch">
                            <input 
                                type="checkbox" 
                                checked={isAutoRefresh}
                                onChange={() => setIsAutoRefresh(!isAutoRefresh)}
                            />
                            <span className="slider"></span>
                        </label>
                        <span>{isAutoRefresh ? '自动刷新' : '手动刷新'}</span>
                    </div>
                    <div className="refresh-interval">
                        <select 
                            value={refreshInterval} 
                            onChange={(e) => setRefreshInterval(Number(e.target.value))}
                            disabled={!isAutoRefresh}
                        >
                            {[5, 10, 30, 60].map(interval => (
                                <option key={interval} value={interval}>
                                    {interval}秒
                                </option>
                            ))}
                        </select>
                    </div>
                    {lastUpdated && (
                        <div className="last-updated">
                            最后更新: {lastUpdated.toLocaleTimeString()}
                        </div>
                    )}
                </div>
            </header>

            <div className="metrics-grid">
                {renderMetricCard('系统指标', metrics.system)}
                {renderMetricCard('数据库指标', metrics.database)}
                {renderMetricCard('连接状态', metrics.connections)}
                {renderMetricCard('评论系统', metrics.reviews)}
                {renderMetricCard('性能指标', metrics.performance)}
                {renderPerformanceDetails()}
                {renderOptimizationSuggestions()}
            </div>
        </div>
    );
};

export default SystemMonitor;