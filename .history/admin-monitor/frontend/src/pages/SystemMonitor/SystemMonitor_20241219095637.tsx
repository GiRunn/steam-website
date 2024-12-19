import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getSystemMetrics, getDatabaseMetrics } from '../../services/monitorService';
import { SystemMetric, DatabaseMetric } from '../../types';
import { LoadingSpinner, ErrorMessage } from '../../components/Common';
import { SystemMetricsChart, DatabasePerformanceChart } from '../../components/Charts';
import { ConnectionMetrics, ResourceMetrics } from '../../components/Metrics';
import './SystemMonitor.css';

const SystemMonitor: React.FC = () => {
    const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
    const [databaseMetrics, setDatabaseMetrics] = useState<DatabaseMetric[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [systemData, databaseData] = await Promise.all([
                    getSystemMetrics(),
                    getDatabaseMetrics()
                ]);
                setSystemMetrics(systemData);
                setDatabaseMetrics(databaseData);
                setIsLoading(false);
            } catch (err) {
                setError('Failed to fetch monitoring data');
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <motion.div 
            className="system-monitor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h1>System Monitor</h1>
            <div className="metrics-container">
                <ResourceMetrics metrics={systemMetrics} />
                <ConnectionMetrics metrics={databaseMetrics} />
            </div>
            <div className="charts-container">
                <SystemMetricsChart data={systemMetrics} />
                <DatabasePerformanceChart data={databaseMetrics} />  
            </div>
        </motion.div>
    );
};

export default SystemMonitor; 