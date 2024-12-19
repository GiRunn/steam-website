import React from 'react';
import './PerformanceDetails.css';

const PerformanceDetails: React.FC<{ details: any }> = ({ details }) => {
    return (
        <div className="performance-details-card glass-effect">
            <h3>性能详情</h3>
            <div>
                <span>平均查询时间: {details.query_performance.avg_query_time}ms</span>
                <span>缓存命中率: {details.query_performance.cache_hit_ratio}%</span>
            </div>
        </div>
    );
};

export default PerformanceDetails; 