import React from 'react';
import { motion } from 'framer-motion';
import { SystemMetric } from '../../../types';
import './ResourceMetrics.css';

interface ResourceMetricsProps {
    metrics: SystemMetric[];
}

const ResourceMetrics: React.FC<ResourceMetricsProps> = ({ metrics }) => {
    return (
        <motion.div 
            className="resource-metrics glass-effect"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <h2>Resource Metrics</h2>
            <div className="metrics-list">
                {metrics.map(metric => (
                    <div key={metric.id} className="metric-item">
                        <span className="metric-name">{metric.metric_name}</span>
                        <span className="metric-value">
                            {metric.metric_value} {metric.metric_unit}
                        </span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default ResourceMetrics; 