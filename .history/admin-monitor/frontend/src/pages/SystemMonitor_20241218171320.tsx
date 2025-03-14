import React, { useState, useEffect } from 'react';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend 
} from 'recharts';
import { getSystemMetrics, getDatabaseMetrics, REFRESH_INTERVAL } from '../services/monitorService';
import ErrorBoundary from '../components/ErrorBoundary';

const SystemMonitor: React.FC = () => {
    const [systemMetrics, setSystemMetrics] = useState<any[]>([]);
    const [databaseMetrics, setDatabaseMetrics] = useState<any[]>([]);
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
        const interval = setInterval(fetchMetrics, REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return <div>加载中...</div>;
    }

    if (error) {
        return <div>错误: {error}</div>;
    }

    return (
        <ErrorBoundary>
            <div className="system-monitor">
                <h1>系统性能监控</h1>
                <div className="metrics-container">
                    <div className="system-metrics">
                        <h2>系统指标</h2>
                        <LineChart width={600} height={300} data={systemMetrics}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="created_at" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="metric_value" stroke="#8884d8" />
                        </LineChart>
                    </div>
                    <div className="database-metrics">
                        <h2>数据库指标</h2>
                        <LineChart width={600} height={300} data={databaseMetrics}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="created_at" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="connections_total" stroke="#82ca9d" />
                        </LineChart>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default SystemMonitor;