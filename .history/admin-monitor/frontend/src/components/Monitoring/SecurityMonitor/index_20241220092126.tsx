import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Table, Alert, Badge } from '../../common';
import { getSecurityEvents } from '../../../services/monitorService';
import './styles.css';

interface SecurityEvent {
  type: 'sql_injection' | 'suspicious_activity';
  description: string;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  severity: 'high' | 'medium' | 'low';
}

interface SecurityData {
  events: SecurityEvent[];
  alerts: string[];
}

const SecurityMonitor: React.FC = () => {
  const [securityData, setSecurityData] = useState<SecurityData>({ events: [], alerts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const columns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Badge 
          status={type === 'sql_injection' ? 'error' : 'warning'} 
          text={type === 'sql_injection' ? 'SQL注入' : '可疑活动'} 
        />
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'IP地址',
      dataIndex: 'ip_address',
      key: 'ip_address'
    },
    {
      title: '用户代理',
      dataIndex: 'user_agent',
      key: 'user_agent'
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => new Date(timestamp).toLocaleString()
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => (
        <Badge 
          status={severity === 'high' ? 'error' : severity === 'medium' ? 'warning' : 'info'} 
          text={
            severity === 'high' ? '高' : 
            severity === 'medium' ? '中' : '低'
          } 
        />
      )
    }
  ];

  useEffect(() => {
    const fetchSecurityEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getSecurityEvents();
        if (result.success) {
          setSecurityData(result.data);
        } else {
          throw new Error(result.message);
        }
      } catch (error: any) {
        console.error('获取安全事件失败:', error);
        setError(error.message || '获取数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchSecurityEvents();
    const interval = setInterval(fetchSecurityEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>加载中...</div>;
  if (error) return <Alert type="error" message={error} />;

  return (
    <motion.div 
      className="security-monitor"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2>安全监控</h2>

      {securityData.alerts && securityData.alerts.length > 0 && (
        <div className="security-alerts">
          {securityData.alerts.map((alert, index) => (
            <Alert
              key={index}
              type="error"
              message={alert}
              showIcon
            />
          ))}
        </div>
      )}

      <Card>
        <Table
          columns={columns}
          dataSource={securityData.events.map((event, index) => ({
            ...event,
            key: index
          }))}
          loading={loading}
        />
      </Card>
    </motion.div>
  );
};

export default SecurityMonitor; 