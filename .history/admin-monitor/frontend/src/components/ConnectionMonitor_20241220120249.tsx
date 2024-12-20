import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from './common/Card';
import Table from './common/Table';

interface ConnectionDetail {
    pid: number;
    username: string;
    client_ip: string;
    database: string;
    state: string;
}

const ConnectionMonitor: React.FC = () => {
    const [connectionDetails, setConnectionDetails] = useState<ConnectionDetail[]>([]);

    useEffect(() => {
        const fetchConnectionDetails = async () => {
            try {
                const response = await axios.get('http://localhost:8877/connections/details');
                if (response.data && response.data.data) {
                    setConnectionDetails(response.data.data);
                }
            } catch (error) {
                console.error('获取连接详情失败:', error);
            }
        };

        fetchConnectionDetails();
        const interval = setInterval(fetchConnectionDetails, 60000); // 每分钟刷新一次

        return () => clearInterval(interval);
    }, []);

    const columns = [
        { 
            key: 'pid', 
            title: 'PID', 
            dataIndex: 'pid' 
        },
        { 
            key: 'username', 
            title: '用户名', 
            dataIndex: 'username' 
        },
        { 
            key: 'client_ip', 
            title: '客户端IP', 
            dataIndex: 'client_ip' 
        },
        { 
            key: 'database', 
            title: '数据库', 
            dataIndex: 'database' 
        },
        { 
            key: 'state', 
            title: '状态', 
            dataIndex: 'state' 
        },
    ];

    return (
        <Card title="连接详情">
            <Table 
                columns={columns} 
                dataSource={connectionDetails} 
            />
        </Card>
    );
};

export default ConnectionMonitor; 