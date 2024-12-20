import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Table, Badge } from '../../common';
import './styles.css';

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
  
  useEffect(() => {
    // 从后端获取连接数据
    const fetchConnections = async () => {
      try {
        const response = await fetch('http://localhost:8877/connections/details');
        const data = await response.json();
        setConnections(data);
      } catch (error) {
        console.error('获取连接数据失败:', error);
      }
    };

    fetchConnections();
    const interval = setInterval(fetchConnections, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="connection-monitor"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2>数据库连接监控</h2>
      <Table
        columns={[
          { title: 'PID', key: 'pid', dataIndex: 'pid' },
          { title: '用户名', key: 'username', dataIndex: 'username' },
          { title: '客户端IP', key: 'client_ip', dataIndex: 'client_ip' },
          { title: '数据库', key: 'database', dataIndex: 'database' },
          { 
            title: '状态', 
            key: 'state',
            dataIndex: 'state',
            render: (state: string) => (
              <Badge 
                status={state === 'active' ? 'success' : 'default'}
                text={state}
              />
            )
          },
          { title: '当前查询', key: 'query', dataIndex: 'query' },
          { title: '连接时间', key: 'connected_at', dataIndex: 'connected_at' },
          { title: '最后活动', key: 'last_activity', dataIndex: 'last_activity' }
        ]}
        dataSource={connections}
      />
    </motion.div>
  );
};

export default ConnectionMonitor; 