import React, { useState, useEffect } from 'react';

const SystemMonitor: React.FC = () => {
    const [metrics, setMetrics] = useState([]);

    useEffect(() => {
        // 这里可以添加获取系统指标的逻辑
        console.log('Fetching system metrics');
    }, []);

    return (
        <div>
            <h1>系统监控</h1>
            {/* 在这里展示系统指标 */}
        </div>
    );
};

export default SystemMonitor;