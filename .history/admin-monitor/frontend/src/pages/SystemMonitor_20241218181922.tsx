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
    getDatabasePerformance
} from '../services/monitorService';

// 主题配色保持不变
const THEME_COLORS = {
    primary: '#3498db',
    secondary: '#2ecc71',
    background: '#1e1e2f',
    card: '#252836',
    text: '#ffffff'
};

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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAllMetrics = async () => {
        try {
            setIsLoading(true);
            const [
                systemData, 
                databaseData, 
                connectionData, 
                performanceData
            ] = await Promise.all([
                getSystemMetrics(),
                getDatabaseMetrics(),
                getConnectionStatus(),
                getDatabasePerformance()
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

            setDatabasePerformance(performanceData || {
                database_name: 'games',
                total_transactions: 0,
                transactions_per_second: 0,
                cache_hit_ratio: 0,
                index_hit_ratio: 0
            });

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
        const interval = setInterval(fetchAllMetrics, 30000);
        return () => clearInterval(interval);
    }, []);

    // 加载和错误状态的渲染保持不变
    if (isLoading) {
        return (
            <div 
                style={{ 
                    backgroundColor: THEME_COLORS.background, 
                    color: THEME_COLORS.text,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                }}
            >
                加载中...
            </div>
        );
    }

    if (error) {
        return (
            <div 
                style={{ 
                    backgroundColor: THEME_COLORS.background, 
                    color: 'red',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                }}
            >
                错误: {error}
            </div>
        );
    }

    return (
        <div 
            style={{ 
                backgroundColor: THEME_COLORS.background, 
                color: THEME_COLORS.text,
                padding: '20px',
                minHeight: '100vh'
            }}
        >
            <h1 
                style={{ 
                    textAlign: 'center', 
                    color: THEME_COLORS.primary,
                    marginBottom: '30px'
                }}
            >
                系统性能监控面板
            </h1>
            <div 
                style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    gap: '20px'
                }}
            >
                {/* 系统指标图表 */}
                <div 
                    style={{ 
                        flex: 1, 
                        backgroundColor: THEME_COLORS.card,
                        borderRadius: '10px',
                        padding: '20px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    <h2 
                        style={{ 
                            color: THEME_COLORS.secondary,
                            marginBottom: '20px'
                        }}
                    >
                        系统指标
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={systemMetrics}>
                            <CartesianGrid 
                                strokeDasharray="3 3" 
                                stroke={THEME_COLORS.text} 
                                opacity={0.2} 
                            />
                            <XAxis 
                                dataKey="created_at" 
                                stroke={THEME_COLORS.text} 
                            />
                            <YAxis 
                                stroke={THEME_COLORS.text} 
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: THEME_COLORS.background,
                                    border: 'none'
                                }} 
                            />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="metric_value" 
                                stroke={THEME_COLORS.primary} 
                                strokeWidth={3}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* 数据库指标图表 */}
                <div 
                    style={{ 
                        flex: 1, 
                        backgroundColor: THEME_COLORS.card,
                        borderRadius: '10px',
                        padding: '20px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    <h2 
                        style={{ 
                            color: THEME_COLORS.secondary,
                            marginBottom: '20px'
                        }}
                    >
                        数据库指标
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={databaseMetrics}>
                            <CartesianGrid 
                                strokeDasharray="3 3" 
                                stroke={THEME_COLORS.text} 
                                opacity={0.2} 
                            />
                            <XAxis 
                                dataKey="created_at" 
                                stroke={THEME_COLORS.text} 
                            />
                            <YAxis 
                                stroke={THEME_COLORS.text} 
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: THEME_COLORS.background,
                                    border: 'none'
                                }} 
                            />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="connections_total" 
                                stroke={THEME_COLORS.secondary} 
                                strokeWidth={3}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 连接状态和性能指标 */}
            <div 
                style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginTop: '20px',
                    gap: '20px'
                }}
            >
                {connectionStatus && (
                    <div 
                        style={{ 
                            flex: 1, 
                            backgroundColor: THEME_COLORS.card,
                            borderRadius: '10px',
                            padding: '20px',
                            color: THEME_COLORS.text
                        }}
                    >
                        <h3 style={{ color: THEME_COLORS.secondary }}>连接状态</h3>
                        <p>总连接数: {connectionStatus.total_connections}</p>
                        <p>活跃连接: {connectionStatus.active_connections}</p>
                        <p>空闲连接: {connectionStatus.idle_connections}</p>
                        <p>最大连接数: {connectionStatus.max_connections}</p>
                    </div>
                )}

                {databasePerformance && (
                    <div 
                        style={{ 
                            flex: 1, 
                            backgroundColor: THEME_COLORS.card,
                            borderRadius: '10px',
                            padding: '20px',
                            color: THEME_COLORS.text
                        }}
                    >
                        <h3 style={{ color: THEME_COLORS.secondary }}>数据库性能</h3>
                        <p>数据库名: {databasePerformance.database_name}</p>
                        <p>总事务数: {databasePerformance.total_transactions}</p>
                        <p>每秒事务数: {databasePerformance.transactions_per_second.toFixed(2)}</p>
                        <p>缓存命中率: {(databasePerformance.cache_hit_ratio * 100).toFixed(2)}%</p>
                        <p>索引命中率: {(databasePerformance.index_hit_ratio * 100).toFixed(2)}%</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SystemMonitor;