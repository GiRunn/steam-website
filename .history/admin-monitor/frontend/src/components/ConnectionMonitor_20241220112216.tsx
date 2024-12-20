import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ConnectionMonitor.css';

interface ConnectionDetail {
    pid: number;
    username: string;
    client_ip: string;
    database: string;
    state: string;
    current_query: string;
    connection_time: string;
    last_activity: string;
}

export const ConnectionMonitor: React.FC = () => {
    const [connections, setConnections] = useState<ConnectionDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchConnectionDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8877/connections/details', {
                headers: {
                    'Accept': 'application/json'
                },
                timeout: 5000
            });

            if (response.data && response.data.code === 200) {
                setConnections(response.data.data || []);
                setError(null);
            } else {
                setError('获取连接详情失败');
                setConnections([]);
            }
        } catch (err) {
            console.error('获取连接详情错误:', err);
            setError('网络错误或服务器异常');
            setConnections([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConnectionDetails();
        const interval = setInterval(fetchConnectionDetails, 30000); // 每30秒刷新一次
        return () => clearInterval(interval);
    }, []);

    const renderConnectionTable = () => {
        if (loading) {
            return (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>正在加载连接详情...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="error-container">
                    <p>{error}</p>
                    <button onClick={fetchConnectionDetails}>重新加载</button>
                </div>
            );
        }

        if (connections.length === 0) {
            return (
                <div className="no-data-container">
                    <p>暂无活跃连接</p>
                    <button onClick={fetchConnectionDetails}>刷新</button>
                </div>
            );
        }

        return (
            <table className="connection-table">
                <thead>
                    <tr>
                        <th>PID</th>
                        <th>用户名</th>
                        <th>客户端IP</th>
                        <th>数据库</th>
                        <th>状态</th>
                        <th>当前查询</th>
                        <th>连接时间</th>
                        <th>最后活动</th>
                    </tr>
                </thead>
                <tbody>
                    {connections.map((conn, index) => (
                        <tr key={index}>
                            <td>{conn.pid}</td>
                            <td>{conn.username}</td>
                            <td>{conn.client_ip}</td>
                            <td>{conn.database}</td>
                            <td>
                                <span className={`connection-state ${conn.state.includes('活动') ? 'active' : 'idle'}`}>
                                    {conn.state}
                                </span>
                            </td>
                            <td title={conn.current_query}>
                                {conn.current_query || '-'}
                            </td>
                            <td>{conn.connection_time}</td>
                            <td>{conn.last_activity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className="connection-monitor glass-effect">
            <div className="monitor-header">
                <h3>数据库连接监控</h3>
                <div className="header-actions">
                    <button onClick={fetchConnectionDetails} className="refresh-btn">
                        <i className="icon-refresh"></i> 刷新
                    </button>
                </div>
            </div>
            <div className="connection-table-container">
                {renderConnectionTable()}
            </div>
        </div>
    );
}; 