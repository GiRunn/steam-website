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

interface APIResponse {
  code: number;
  data: Connection[];
  timestamp: string;
}

const ConnectionMonitor: React.FC = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8877/connections/details');
        const result: APIResponse = await response.json();
        
        if (result.code === 200 && Array.isArray(result.data)) {
          setConnections(result.data);
          setError(null);
        } else {
          setError('数据格式错误');
        }
      } catch (error) {
        console.error('获取连接数据失败:', error);
        setError('获取数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
    const interval = setInterval(fetchConnections, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStateColor = (state: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (state.toLowerCase()) {
      case 'active':
        return 'success';
      case 'idle in transaction':
        return 'warning';
      case 'idle':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <motion.div 
      className="connection-monitor"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2>数据库连接监控</h2>
      {loading && <div className="loading">加载中...</div>}
      {error && <div className="error">{error}</div>}
      {!loading && !error && (
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
                  status={getStateColor(state)}
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
                  {query.length > 50 ? query.slice(0, 50) + '...' : query}
                </div>
              )
            },
            { 
              title: '连接时间', 
              key: 'connected_at', 
              dataIndex: 'connected_at',
              render: (timestamp: string) => formatTimestamp(timestamp)
            },
            { 
              title: '最后活动', 
              key: 'last_activity', 
              dataIndex: 'last_activity',
              render: (timestamp: string) => formatTimestamp(timestamp)
            }
          ]}
          dataSource={connections}
        />
      )}
    </motion.div>
  );
};

export default ConnectionMonitor; 