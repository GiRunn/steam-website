import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ConnectionMonitor.css';

interface ConnectionDetail {
    pid: number;
    username: string;
    client_ip: string;
    database: string;
    state: string;
    query: string;
    connected_at: string;
    last_activity: string;
    query_duration: string;
}

const ConnectionMonitor: React.FC = () => {
    const [connections, setConnections] = useState<ConnectionDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchConnections = async () => {
            try {
                const response = await axios.get('/api/connections/details');
                setConnections(response.data.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching connection details:', err);
                setError('获取数据失败，请稍后重试');
            } finally {
                setLoading(false);
            }
        };

        fetchConnections();
    }, []);

    if (loading) {
        return <div className="loading">加载中...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="connection-monitor">
            <h2>数据库连接监控</h2>
            <div className="connection-table-container">
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
                        {connections.length > 0 ? (
                            connections.map((conn) => (
                                <tr key={conn.pid}>
                                    <td>{conn.pid}</td>
                                    <td>{conn.username}</td>
                                    <td>{conn.client_ip}</td>
                                    <td>{conn.database}</td>
                                    <td>{conn.state}</td>
                                    <td className="query-cell" title={conn.query}>
                                        {conn.query}
                                    </td>
                                    <td>{conn.connected_at}</td>
                                    <td>{conn.last_activity}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="no-data">暂无数据</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ConnectionMonitor; 