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
import axios, { isAxiosError } from '../utils/axios';

import './SystemMonitor.css';
import MetricsChart from '../components/Charts/MetricsChart';
import {
  ConnectionMonitor,
  ReviewSystemMonitor,
  SecurityMonitor,
  PartitionMonitor
} from '../components/Monitoring';

// 定义指标接口
interface Metric {
    name: string;
    value: number | string;
    unit?: string;
    trend?: 'up' | 'down' | 'stable';
}

// 添加新的接口
interface PerformanceDetails {
    avg_query_time: number;
    cache_hit_ratio: number;
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

interface OptimizationSuggestion {
    slow_queries: Array<{
        query: string;
        avg_time_ms: number;
        calls: number;
        rows_per_call: number;
    }>;
    table_suggestions: any[];
    index_suggestions: any[];
}

interface MetricsHistory {
    cpu: Array<{ timestamp: string; value: number }>;
    memory: Array<{ timestamp: string; value: number }>;
    connections: Array<{ timestamp: string; value: number }>;
    transactions: Array<{ timestamp: string; value: number }>;
}

interface SystemMonitorState {
    performanceDetails: PerformanceDetails | null;
    // ... 其他状态属性
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

    const [refreshInterval, setRefreshInterval] = useState(1);
    const [isAutoRefresh, setIsAutoRefresh] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const [state, setState] = useState<SystemMonitorState>({
        performanceDetails: null,
        // ... 其他初始状态
    });

    const [loading, setLoading] = useState(true);

    const [optimizationSuggestions, setOptimizationSuggestions] = useState<OptimizationSuggestion>({
        slow_queries: [],
        table_suggestions: [],
        index_suggestions: []
    });

    // 添加历史数据状态用于图表显示
    const [metricsHistory, setMetricsHistory] = useState<MetricsHistory>({
        cpu: [],
        memory: [],
        connections: [],
        transactions: []
    });

    const [timeRange, setTimeRange] = useState('1h');

    const [reviewStats, setReviewStats] = useState(null);
    const [error, setError] = useState<string | null>(null);

    const fetchMetrics = useCallback(async () => {
        try {
            // 获取所有指标数据
            const [
                systemData,
                databaseData,
                connectionData,
                reviewData,
                performanceData,
                performanceDetailsData,
                optimizationData,
                metricsHistoryData
            ] = await Promise.all([
                getSystemMetrics(),
                getDatabaseMetrics(),
                getConnectionStatus(),
                getReviewSystemMetrics(),
                getPerformanceMetrics(),
                getDatabasePerformanceDetails(),
                getOptimizationSuggestions(),
                getSystemMetricsHistory(timeRange)
            ]);

            // 更新指标数据
            setMetrics({
                system: [
                    { name: 'CPU使用率', value: systemData?.cpu_usage || 0, unit: '%', trend: 'stable' },
                    { name: '内存使用', value: systemData?.memory_usage || 0, unit: '%', trend: 'stable' }
                ],
                database: [
                    { name: '数据库大小', value: databaseData?.size || 0, unit: 'MB', trend: 'up' },
                    { name: '连接数', value: databaseData?.connections || 0, trend: 'stable' }
                ],
                connections: [
                    { name: '总连接数', value: connectionData?.total_connections || 0, trend: 'stable' },
                    { name: '活跃连接', value: connectionData?.active_connections || 0, trend: 'stable' }
                ],
                reviews: [
                    { name: '总评论数', value: reviewData?.total_reviews || 0, trend: 'up' },
                    { name: '平均评分', value: reviewData?.avg_rating || 0, unit: '分', trend: 'stable' }
                ],
                performance: [
                    { name: '缓存命中率', value: performanceData?.cache_hit_ratio || 0, unit: '%', trend: 'stable' },
                    { name: '每秒事务', value: performanceData?.transactions_per_second || 0, trend: 'stable' }
                ]
            });

            // 更新历史数据，添加类型检查和默认值
            const formattedHistory: MetricsHistory = {
                cpu: [],
                memory: [],
                connections: [],
                transactions: []
            };

            if (Array.isArray(metricsHistoryData)) {
                formattedHistory.cpu = metricsHistoryData.map(item => ({
                    timestamp: new Date(item.timestamp).toLocaleTimeString(),
                    value: Number(item.cpu_usage || 0)
                }));
                formattedHistory.memory = metricsHistoryData.map(item => ({
                    timestamp: new Date(item.timestamp).toLocaleTimeString(),
                    value: Number(item.memory_usage || 0)
                }));
                formattedHistory.connections = metricsHistoryData.map(item => ({
                    timestamp: new Date(item.timestamp).toLocaleTimeString(),
                    value: Number(item.connections || 0)
                }));
                formattedHistory.transactions = metricsHistoryData.map(item => ({
                    timestamp: new Date(item.timestamp).toLocaleTimeString(),
                    value: Number(item.transaction_rate || 0)
                }));
            }

            setMetricsHistory(formattedHistory);
            setOptimizationSuggestions(optimizationData || {
                slow_queries: [],
                table_suggestions: [],
                index_suggestions: []
            });
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching metrics:', error);
            // 设置默认值
            setMetricsHistory({
                cpu: [],
                memory: [],
                connections: [],
                transactions: []
            });
        }
    }, [timeRange]);

    useEffect(() => {
        fetchMetrics(); // 初始加载
        
        if (isAutoRefresh) {
            const intervalId = setInterval(fetchMetrics, refreshInterval * 1000);
            return () => clearInterval(intervalId);
        }
    }, [fetchMetrics, isAutoRefresh, refreshInterval]); // 添加 fetchMetrics 作为依赖项

    useEffect(() => {
        const fetchPerformanceDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:8877/database-performance-details');
                const data = await response.json();
                if (data.code === 200) {
                    setState(prev => ({
                        ...prev,
                        performanceDetails: data.data
                    }));
                }
            } catch (error) {
                console.error('Failed to fetch performance details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPerformanceDetails();
    }, []);

    useEffect(() => {
        const fetchReviewStats = async () => {
            try {
                const response = await axios.get('http://localhost:8877/review-system/stats', {
                    withCredentials: false,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                console.log('完整响应:', response);

                // 精确的类型检查和处理
                if (response && response.data && response.data.code === 200) {
                    setReviewStats(response.data.data);
                    console.log('成功获取评论统计:', response.data.data);
                } else {
                    console.error('响应状态异常:', response);
                    throw new Error('无法获取有效的评论统计数据');
                }
            } catch (err: any) {
                console.error('获取评论统计失败:', err);
                
                if (isAxiosError(err)) {
                    if (err.response) {
                        console.error('服务器错误:', err.response.status, err.response.data);
                        
                        // 精确的错误处理
                        if (err.response.data && err.response.data.code === 500) {
                            setError(`服务器错误: ${err.response.status} - ${err.response.data.message}`);
                        } else if (err.response.data && err.response.data.data) {
                            setReviewStats(err.response.data.data);
                        } else {
                            setError(`服务器错误: ${err.response.status}`);
                        }
                    } else if (err.request) {
                        console.error('无法连接到服务器:', err.request);
                        setError('无法连接到服务器，请检查网络连接');
                    } else {
                        console.error('请求发送失败:', err.message);
                        setError('请求发送失败');
                    }
                } else {
                    setError(err.message || '发生未知错误');
                }
            }
        };

        fetchReviewStats();
    }, []);

    const renderMetricCard = (title: string, metrics: Metric[] | undefined, icon: string) => {
        if (!metrics) {
            return (
                <motion.div 
                    className="metric-card glass-effect"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="card-header">
                        <i className={icon}></i>
                        <h3>{title}</h3>
                    </div>
                    <div className="metric-content">
                        <div className="no-data">暂无数据</div>
                    </div>
                </motion.div>
            );
        }

        return (
            <motion.div 
                className="metric-card glass-effect"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="card-header">
                    <i className={icon}></i>
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
    };

    if (error) {
        return <div>错误: {error}</div>;
    }

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
                                <label className="switch" htmlFor="auto-refresh-toggle">
                                    <input 
                                        id="auto-refresh-toggle"
                                        type="checkbox" 
                                        checked={isAutoRefresh}
                                        onChange={() => setIsAutoRefresh(!isAutoRefresh)}
                                        aria-label="自动刷新开关"
                                        title="启用或禁用自动刷新"
                                    />
                                    <span className="slider"></span>
                                </label>
                                <span className="toggle-label" aria-hidden="true">
                                    {isAutoRefresh ? '自动刷新' : '手动刷新'}
                                </span>
                            </div>
                            <select 
                                value={refreshInterval}
                                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                                disabled={!isAutoRefresh}
                                aria-label="刷新间隔"
                                title="选择数据刷新的时间间隔"
                            >
                                <option value="1">1秒</option>
                                <option value="5">5秒</option>
                                <option value="10">10秒</option>
                                <option value="30">30秒</option>
                                <option value="60">1分钟</option>
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
                        {renderMetricCard('系统指标', metrics?.system, 'icon-cpu')}
                        {renderMetricCard('数据库指标', metrics?.database, 'icon-database')}
                        {renderMetricCard('连接状态', metrics?.connections, 'icon-network')}
                        {renderMetricCard('评论系统', metrics?.reviews, 'icon-comments')}
                    </div>

                    <div className="charts-section">
                        {metricsHistory?.cpu && Array.isArray(metricsHistory.cpu) && metricsHistory.cpu.length > 0 && (
                            <MetricsChart 
                                data={metricsHistory.cpu}
                                title="CPU使用率趋势"
                                color="#4fc3f7"
                                dataKey="cpu"
                                timeRange={timeRange}
                                onTimeRangeChange={setTimeRange}
                            />
                        )}
                        {metricsHistory?.memory && Array.isArray(metricsHistory.memory) && metricsHistory.memory.length > 0 && (
                            <MetricsChart 
                                data={metricsHistory.memory}
                                title="内存使用趋势"
                                color="#81c784"
                                dataKey="memory"
                                timeRange={timeRange}
                                onTimeRangeChange={setTimeRange}
                            />
                        )}
                        {metricsHistory?.connections && Array.isArray(metricsHistory.connections) && metricsHistory.connections.length > 0 && (
                            <MetricsChart 
                                data={metricsHistory.connections}
                                title="连接数趋势"
                                color="#ff8a65"
                                dataKey="connections"
                                timeRange={timeRange}
                                onTimeRangeChange={setTimeRange}
                            />
                        )}
                        {metricsHistory?.transactions && Array.isArray(metricsHistory.transactions) && metricsHistory.transactions.length > 0 && (
                            <MetricsChart 
                                data={metricsHistory.transactions}
                                title="事务处理趋势"
                                color="#ba68c8"
                                dataKey="transactions"
                                timeRange={timeRange}
                                onTimeRangeChange={setTimeRange}
                            />
                        )}
                    </div>

                    <motion.div 
                        className="performance-details-card glass-effect"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h3 className="card-title">性能详情</h3>
                        <div className="performance-metrics-grid">
                            <div className="metric-detail-card">
                                <div className="metric-icon">
                                    <i className="fas fa-clock"></i>
                                </div>
                                <div className="metric-detail">
                                    <span className="metric-label">平均查询时间</span>
                                    <span className="metric-value">
                                        {loading ? '加载中...' : (state.performanceDetails?.avg_query_time?.toFixed(4) || '暂无数据')} ms
                                    </span>
                                </div>
                            </div>

                            <div className="metric-detail-card">
                                <div className="metric-icon">
                                    <i className="fas fa-database"></i>
                                </div>
                                <div className="metric-detail">
                                    <span className="metric-label">缓存命中率</span>
                                    <span className="metric-value">
                                        {loading ? '加载中...' : (state.performanceDetails?.cache_hit_ratio?.toFixed(2) || '暂无数据')} %
                                    </span>
                                </div>
                            </div>

                            <div className="metric-detail-card connection-stats">
                                <div className="connection-header">
                                    <i className="fas fa-network-wired"></i>
                                    <span>连接状态分布</span>
                                </div>
                                <div className="connection-numbers">
                                    <div className="connection-item">
                                        <span className="connection-label">活跃</span>
                                        <span className="connection-value active">
                                            {loading ? '加载中...' : 
                                             (state.performanceDetails?.connection_stats?.active_connections ?? '暂无数据')}
                                        </span>
                                    </div>
                                    <div className="connection-item">
                                        <span className="connection-label">空闲</span>
                                        <span className="connection-value idle">
                                            {loading ? '加载中...' : 
                                             (state.performanceDetails?.connection_stats?.idle_connections ?? '暂无数据')}
                                        </span>
                                    </div>
                                    <div className="connection-item">
                                        <span className="connection-label">等待</span>
                                        <span className="connection-value waiting">
                                            {loading ? '加载中...' : 
                                             (state.performanceDetails?.connection_stats?.waiting_connections ?? '暂无数据')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        className="detail-card glass-effect"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h3>优化建议</h3>
                        <div className="suggestions-list">
                            {optimizationSuggestions?.slow_queries?.map((query, index) => (
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
                                        <p className="query-text">{query.query}</p>
                                        <div className="query-stats">
                                            <span>平均执行时间: {query.avg_time_ms}ms</span>
                                            <span>调用次数: {query.calls}</span>
                                            <span>每次返回行数: {query.rows_per_call}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <div className="monitoring-grid">
                        <ConnectionMonitor />
                        <ReviewSystemMonitor />
                        <SecurityMonitor />
                        <PartitionMonitor />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemMonitor;