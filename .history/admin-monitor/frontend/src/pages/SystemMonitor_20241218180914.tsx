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
import { getSystemMetrics, getDatabaseMetrics } from '../services/monitorService';

// 定义更丰富的主题配色
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
}

const SystemMonitor: React.FC = () => {
    const [systemMetrics, setSystemMetrics] = useState<Metric[]>([]);
    const [databaseMetrics, setDatabaseMetrics] = useState<Metric[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                setIsLoading(true);
                const systemData = await getSystemMetrics();
                const databaseData = await getDatabaseMetrics();
                setSystemMetrics(systemData);
                setDatabaseMetrics(databaseData);
                setError(null);
            } catch (err) {
                setError('获取指标失败');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMetrics();
        const interval = setInterval(fetchMetrics, 30000);
        return () => clearInterval(interval);
    }, []);

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
        </div>
    );
};

export default SystemMonitor;