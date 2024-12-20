import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ConnectionMonitor.css';

interface Connection {
    pid: number;
    username: string;
    client_ip: string;
    database: string;
    state: string;
    query: string;
    connected_at: string;
    last_activity: string;
}

const ConnectionMonitor: React.FC = () => {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchConnections = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8877/connections/details');
            if (response.data.code === 200) {
                setConnections(response.data.data);
                setError(null);
            } else {
                throw new Error(response.data.message || '获取数据失败');
            }
        } catch (err) {
            setError('获取数据失败，请稍后重试');
            console.error('Error fetching connections:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConnections();
        // 每30秒刷新一次数据
        const interval = setInterval(fetchConnections, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return <div className="loading">加载中...</div>;
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">{error}</div>
                <button onClick={fetchConnections} className="retry-button">
                    重试
                </button>
            </div>
        );
    }

    return (
        <div className="connection-monitor">
            <h2>数据库连接监控</h2>
            <div className="table-container">
                <table>
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
                        {connections.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="no-data">暂无数据</td>
                            </tr>
                        ) : (
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
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ConnectionMonitor; 