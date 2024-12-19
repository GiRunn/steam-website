import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
    getSystemMetrics, 
    getDatabaseMetrics,
    getConnectionStatus,
    getReviewSystemMetrics,
    getReviewSystemAnomalies,
    getPartitionStats,
    getPerformanceMetrics
} from '../services/monitorService';

import './SystemMonitor.css';

// 定义指标接口
interface Metric {
    name: string;
    value: number | string;
    unit?: string;
    trend?: 'up' | 'down' | 'stable';
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

    const fetchMetrics = useCallback(async () => {
        try {
            const [
                systemData,
                databaseData,
                connectionData,
                reviewData,
                performanceData
            ] = await Promise.all([
                getSystemMetrics(),
                getDatabaseMetrics(),
                getConnectionStatus(),
                getReviewSystemMetrics(),
                getPerformanceMetrics()
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
            </div>
        </div>
    );
};

export default SystemMonitor;