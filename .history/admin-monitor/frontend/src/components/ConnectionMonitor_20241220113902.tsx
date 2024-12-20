import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Table } from './common';

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

const ConnectionMonitor: React.FC = () => {
    const [connections, setConnections] = useState<ConnectionDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchConnectionDetails = async () => {
            try {
                const response = await axios.get('http://localhost:8877/connections/details');
                console.log('连接详情响应:', response.data);
                
                // 检查响应数据结构
                if (response.data && Array.isArray(response.data)) {
                    setConnections(response.data);
                } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                    setConnections(response.data.data);
                } else {
                    console.error('无效的响应数据格式:', response.data);
                    setError('无法解析连接详情');
                }
                setLoading(false);
            } catch (err) {
                console.error('获取连接详情失败:', err);
                setError('获取连接详情失败');
                setLoading(false);
            }
        };

        fetchConnectionDetails();
        const intervalId = setInterval(fetchConnectionDetails, 5000); // 每5秒刷新一次

        return () => clearInterval(intervalId);
    }, []);

    const columns = [
        { title: 'PID', dataIndex: 'pid', key: 'pid' },
        { title: '用户名', dataIndex: 'username', key: 'username' },
        { title: '客户端IP', dataIndex: 'client_ip', key: 'client_ip' },
        { title: '数据库', dataIndex: 'database', key: 'database' },
        { title: '状态', dataIndex: 'state', key: 'state' },
        { title: '当前查询', dataIndex: 'current_query', key: 'current_query' },
        { title: '连接时间', dataIndex: 'connection_time', key: 'connection_time' },
        { title: '最后活动', dataIndex: 'last_activity', key: 'last_activity' }
    ];

    if (loading) return <div>加载中...</div>;
    if (error) return <div>错误: {error}</div>;

    return (
        <Card title="数据库连接监控">
            <Table 
                columns={columns} 
                dataSource={connections} 
                rowKey="pid"
            />
        </Card>
    );
};

export default ConnectionMonitor; 