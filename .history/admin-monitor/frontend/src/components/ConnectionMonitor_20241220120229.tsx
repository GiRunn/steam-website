import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from './common/Card';
import Table from './common/Table';

const ConnectionMonitor: React.FC = () => {
    const [connectionDetails, setConnectionDetails] = useState([]);

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
        { title: 'PID', dataIndex: 'pid' },
        { title: '用户名', dataIndex: 'username' },
        { title: '客户端IP', dataIndex: 'client_ip' },
        { title: '数据库', dataIndex: 'database' },
        { title: '状态', dataIndex: 'state' },
    ];

    return (
        <Card title="连接详情">
            <Table 
                columns={columns} 
                dataSource={connectionDetails} 
                rowKey="pid"
            />
        </Card>
    );
};

export default ConnectionMonitor; 