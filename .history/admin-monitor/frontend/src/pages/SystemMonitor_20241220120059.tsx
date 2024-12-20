import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../components/common/Card';
import Statistic from '../components/common/Statistic';

interface SystemMetrics {
    cpu_usage: number;
    memory_usage: number;
    database_size: string;
    database_size_bytes: number;
    active_connections: number;
    total_connections: number;
    max_connections: number;
}

const SystemMonitor: React.FC = () => {
    const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSystemMetrics = async () => {
            try {
                const response = await axios.get('http://localhost:8877/system-metrics');
                setMetrics(response.data.data);
                setLoading(false);
            } catch (err) {
                console.error('获取系统指标失败:', err);
                setError('无法获取系统指标');
                setLoading(false);
            }
        };

        fetchSystemMetrics();
        const intervalId = setInterval(fetchSystemMetrics, 5000); // 每5秒刷新一次

        return () => clearInterval(intervalId);
    }, []);

    if (loading) return <div>加载中...</div>;
    if (error) return <div>{error}</div>;
    if (!metrics) return <div>无可用数据</div>;

    return (
        <div className="system-monitor">
            <Card title="系统资源监控">
                <div className="metrics-grid">
                    <Statistic 
                        title="CPU使用率" 
                        value={`${metrics.cpu_usage}%`} 
                        precision={2}
                    />
                    <Statistic 
                        title="内存使用率" 
                        value={`${metrics.memory_usage}%`} 
                        precision={2}
                    />
                    <Statistic 
                        title="数据库大小" 
                        value={metrics.database_size} 
                    />
                    <Statistic 
                        title="连接数" 
                        value={`${metrics.active_connections} / ${metrics.max_connections}`} 
                    />
                </div>
            </Card>
        </div>
    );
};

export default SystemMonitor;