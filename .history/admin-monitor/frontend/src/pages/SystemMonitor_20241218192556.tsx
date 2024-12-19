import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
    getSystemMetrics, 
    getDatabaseMetrics,
    getConnectionStatus,
    getReviewSystemMetrics,
    getPerformanceMetrics,
    getDatabasePerformanceDetails,
    getOptimizationSuggestions,
    getSystemMetricsHistory
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

    // 添加历史数据状态用于图表显示
    const [metricsHistory, setMetricsHistory] = useState<{
        cpu: any[];
        memory: any[];
        connections: any[];
        transactions: any[];
    }>({
        cpu: [],
        memory: [],
        connections: [],
        transactions: []
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

            // 更新指标数据
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

            // 更新历史数据
            const timestamp = new Date().toLocaleTimeString();
            setMetricsHistory(prev => ({
                cpu: [...prev.cpu.slice(-20), { time: timestamp, value: systemData.cpu_usage }],
                memory: [...prev.memory.slice(-20), { time: timestamp, value: systemData.memory_usage }],
                connections: [...prev.connections.slice(-20), { time: timestamp, value: connectionData.total_connections }],
                transactions: [...prev.transactions.slice(-20), { time: timestamp, value: performanceData.transactions_per_second }]
            }));

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

    const renderMetricCard = (title: string, metrics: Metric[], icon: string) => (
        <motion.div 
            className="metric-card glass-effect"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
        >
            <div className="card-header">
                <i className={`metric-icon ${icon}`}></i>
                <h3>{title}</h3>
            </div>
            <div className="metric-content">
                {metrics.map((metric, index) => (
                    <div key={index} className="metric-item">
                        <div className="metric-info">
                            <span className="metric-name">{metric.name}</span>
                            <div className="metric-value-container">
                                <span className="metric-value">
                                    {typeof metric.value === 'number' ? 
                                        metric.value.toLocaleString() : metric.value}
                                </span>
                                {metric.unit && 
                                    <span className="metric-unit">{metric.unit}</span>}
                            </div>
                        </div>
                        <div className="metric-trend">
                            {metric.trend && (
                                <motion.span 
                                    className={`trend-badge ${metric.trend}`}
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                >
                                    {metric.trend === 'up' ? '↑' : 
                                     metric.trend === 'down' ? '↓' : '→'}
                                </motion.span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );

    const renderChart = (data: any[], title: string, dataKey: string, color: string) => (
        <motion.div 
            className="chart-card glass-effect"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="chart-header">
                <h3>{title}</h3>
                <div className="chart-controls">
                    <select className="time-range">
                        <option value="1h">1小时</option>
                        <option value="24h">24小时</option>
                        <option value="7d">7天</option>
                    </select>
                </div>
            </div>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id={`gradient${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                                <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke="rgba(255,255,255,0.1)" 
                            vertical={false}
                        />
                        <XAxis 
                            dataKey="time" 
                            stroke="#8884d8" 
                            tick={{ fill: '#acb2b8' }}
                        />
                        <YAxis 
                            stroke="#8884d8" 
                            tick={{ fill: '#acb2b8' }}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                background: 'rgba(42, 71, 94, 0.9)',
                                border: '1px solid #66c0f4',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                            labelStyle={{ color: '#fff' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke={color}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill={`url(#gradient${dataKey})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );

    return (
        <div className="system-monitor">
            <motion.header 
                className="monitor-header glass-effect"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="header-content">
                    <div className="header-left">
                        <h1>系统性能监控</h1>
                        <p className="subtitle">实时监控与分析</p>
                    </div>
                    <div className="monitor-controls">
                        <div className="control-group">
                            <div className="auto-refresh-toggle">
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={isAutoRefresh}
                                        onChange={() => setIsAutoRefresh(!isAutoRefresh)}
                                    />
                                    <span className="slider"></span>
                                </label>
                                <span className="toggle-label">
                                    {isAutoRefresh ? '自动刷新' : '手动刷新'}
                                </span>
                            </div>
                            <select 
                                className="refresh-interval glass-select"
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
                                <i className="icon-clock"></i>
                                最后更新: {lastUpdated.toLocaleTimeString()}
                            </div>
                        )}
                    </div>
                </div>
            </motion.header>

            <div className="dashboard-container">
                <div className="dashboard-grid">
                    <div className="metrics-section">
                        {renderMetricCard('系统指标', metrics.system, 'icon-cpu')}
                        {renderMetricCard('数据库指标', metrics.database, 'icon-database')}
                        {renderMetricCard('连接状态', metrics.connections, 'icon-network')}
                        {renderMetricCard('评论系统', metrics.reviews, 'icon-comments')}
                    </div>

                    <div className="charts-section">
                        {renderChart(metricsHistory.cpu, 'CPU使用率趋势', 'cpu', '#4fc3f7')}
                        {renderChart(metricsHistory.memory, '内存使用趋势', 'memory', '#81c784')}
                        {renderChart(metricsHistory.connections, '连接数趋势', 'connections', '#ff8a65')}
                        {renderChart(metricsHistory.transactions, '事务处理趋势', 'transactions', '#ba68c8')}
                    </div>

                    <div className="details-section">
                        <motion.div 
                            className="detail-card glass-effect"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h3>性能详情</h3>
                            <div className="performance-stats">
                                <div className="stat-group">
                                    <div className="stat-item">
                                        <div className="stat-icon cpu"></div>
                                        <div className="stat-info">
                                            <span className="stat-label">平均查询时间</span>
                                            <span className="stat-value">
                                                {performanceDetails.query_performance.avg_query_time}ms
                                            </span>
                                        </div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-icon memory"></div>
                                        <div className="stat-info">
                                            <span className="stat-label">缓存命中率</span>
                                            <span className="stat-value">
                                                {performanceDetails.query_performance.cache_hit_ratio}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="connection-stats">
                                    <h4>连接状态分布</h4>
                                    <div className="pie-chart-container">
                                        <ResponsiveContainer width="100%" height={200}>
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: '活跃', value: performanceDetails.connection_stats.active_connections },
                                                        { name: '空闲', value: performanceDetails.connection_stats.idle_connections },
                                                        { name: '等待', value: performanceDetails.connection_stats.waiting_connections }
                                                    ]}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    nameKey="name"
                                                >
                                                    <Cell fill="#4fc3f7" />
                                                    <Cell fill="#81c784" />
                                                    <Cell fill="#ff8a65" />
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            className="detail-card glass-effect"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h3>优化建议</h3>
                            <div className="suggestions-list">
                                {optimizationSuggestions.slow_queries.map((query, index) => (
                                    <motion.div 
                                        key={index}
                                        className="suggestion-item"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="suggestion-header">
                                            <span className="suggestion-type">
                                                <i className="icon-warning"></i>
                                                慢查询 #{index + 1}
                                            </span>
                                            <span className="suggestion-metric">
                                                {query.avg_time_ms}ms
                                            </span>
                                        </div>
                                        <div className="suggestion-content">
                                            <p>调用次数: {query.calls}</p>
                                            <div className="suggestion-actions">
                                                <button className="action-button">
                                                    <i className="icon-optimize"></i>
                                                    优化建议
                                                </button>
                                                <button className="action-button">
                                                    <i className="icon-details"></i>
                                                    详情
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemMonitor;