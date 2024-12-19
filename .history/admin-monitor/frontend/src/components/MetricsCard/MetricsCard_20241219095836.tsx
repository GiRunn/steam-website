import React from 'react';
import './MetricsCard.css';

interface Metric {
    name: string;
    value: number | string;
    unit?: string;
    trend?: 'up' | 'down' | 'stable';
}

const MetricsCard: React.FC<{ title: string; metrics: Metric[] }> = ({ title, metrics }) => {
    return (
        <div className="metric-card glass-effect">
            <div className="card-header">
                <h3>{title}</h3>
            </div>
            <div className="metric-content">
                {metrics.map((metric, index) => (
                    <div key={index} className="metric-item">
                        <div className="metric-info">
                            <span className="metric-name">{metric.name}</span>
                            <span className="metric-value">{metric.value} {metric.unit}</span>
                        </div>
                        <div className={`metric-trend ${metric.trend}`}>
                            {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MetricsCard; 