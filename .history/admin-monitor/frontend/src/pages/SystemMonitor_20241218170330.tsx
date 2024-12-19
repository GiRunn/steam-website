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
import { getSystemMetrics, getDatabaseMetrics } from '../services/monitorService';

const SystemMonitor: React.FC = () => {
    const [systemMetrics, setSystemMetrics] = useState([]);
    const [databaseMetrics, setDatabaseMetrics] = useState([]);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const systemData = await getSystemMetrics();
                const databaseData = await getDatabaseMetrics();
                setSystemMetrics(systemData);
                setDatabaseMetrics(databaseData);
            } catch (error) {
                console.error('获取指标失败', error);
            }
        };

        fetchMetrics();
        const interval = setInterval(fetchMetrics, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
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
function App() {
  return (
    <div className="App">
      <SystemMonitor />
    </div>
  );
}

export default App;