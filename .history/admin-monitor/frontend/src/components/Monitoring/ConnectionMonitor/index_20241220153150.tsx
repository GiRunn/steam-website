import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Table, Badge, Alert } from '../../common';
import LoadingSpinner from '../../common/LoadingSpinner';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        setError(null);
        const response = await fetch('http://localhost:8877/connections/details');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setConnections(data.data || []); // 确保处理返回的数据结构
      } catch (error) {
        console.error('获取连接数据失败:', error);
        setError('获取连接数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
    const interval = setInterval(fetchConnections, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <motion.div 
        className="connection-monitor"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Alert type="error" message={error} />
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="connection-monitor"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2>数据库连接监控</h2>
      {connections.length === 0 ? (
        <div className="no-data">暂无连接数据</div>
      ) : (
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
            { 
              title: '当前查询', 
              key: 'query', 
              dataIndex: 'query',
              render: (query: string) => (
                <div className="query-cell" title={query}>
                  {query || '-'}
                </div>
              )
            },
            { title: '连接时间', key: 'connected_at', dataIndex: 'connected_at' },
            { title: '最后活动', key: 'last_activity', dataIndex: 'last_activity' }
          ]}
          dataSource={connections}
        />
      )}
    </motion.div>
  );
};

export default ConnectionMonitor; 