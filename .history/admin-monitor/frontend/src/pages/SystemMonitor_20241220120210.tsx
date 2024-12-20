import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../components/common/Card';
import Statistic from '../components/common/Statistic';
import ConnectionMonitor from '../components/ConnectionMonitor';

const SystemMonitor: React.FC = () => {
    const [systemMetrics, setSystemMetrics] = useState({
        cpu_usage: 0,
        memory_usage: 0,
        database_size: '0 MB',
        database_size_bytes: 0,
        active_connections: 0,
        total_connections: 0,
        max_connections: 0
    });

    useEffect(() => {
        const fetchSystemMetrics = async () => {
            try {
                const response = await axios.get('http://localhost:8877/system-metrics');
                if (response.data && response.data.data) {
                    setSystemMetrics(response.data.data);
                }
            } catch (error) {
                console.error('获取系统指标失败:', error);
            }
        };

        fetchSystemMetrics();
        const interval = setInterval(fetchSystemMetrics, 60000); // 每分钟刷新一次

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="system-monitor">
            <div className="metrics-grid">
                <Card title="系统资源">
                    <div className="metrics-row">
                        <Statistic 
                            title="CPU 使用率" 
                            value={`${systemMetrics.cpu_usage}%`} 
                            precision={2} 
                        />
                        <Statistic 
                            title="内存使用率" 
                            value={`${systemMetrics.memory_usage}%`} 
                            precision={2} 
                        />
                    </div>
                </Card>

                <Card title="数据库指标">
                    <div className="metrics-row">
                        <Statistic 
                            title="数据库大小" 
                            value={systemMetrics.database_size} 
                        />
                        <Statistic 
                            title="连接数" 
                            value={`${systemMetrics.total_connections} / ${systemMetrics.max_connections}`} 
                        />
                    </div>
                </Card>

                <ConnectionMonitor />
            </div>
        </div>
    );
};

export default SystemMonitor;