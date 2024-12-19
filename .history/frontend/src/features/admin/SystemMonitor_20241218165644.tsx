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
import { fetchSystemMetrics } from '../services/adminService';

interface Metric {
    metric_name: string;
    metric_value: number;
    metric_unit: string;
    timestamp: string;
}

const SystemMonitor: React.FC = () => {
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [realTimeMetrics, setRealTimeMetrics] = useState<any[]>([]);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const historicalData = await fetchSystemMetrics();
                setMetrics(historicalData);
            } catch (error) {
                console.error('获取系统指标失败', error);
            }
        };

        fetchMetrics();
        const interval = setInterval(fetchMetrics, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="system-monitor">
            <h1>系统性能监控</h1>
            <div className="metrics-grid">
                {realTimeMetrics.map(metric => (
                    <div key={metric.metric_name} className="metric-card">
                        <h3>{metric.metric_name}</h3>
                        <p>{metric.metric_value} {metric.metric_unit}</p>
                    </div>
                ))}
            </div>
            <LineChart width={800} height={400} data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                    type="monotone" 
                    dataKey="metric_value" 
                    stroke="#8884d8" 
                />
            </LineChart>
        </div>
    );
};

export default SystemMonitor; 