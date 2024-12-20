import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Alert, Table, Badge } from '../common';
import './styles.css';

interface SecurityEvent {
  id: number;
  type: 'sql_injection' | 'xss' | 'suspicious_activity';
  description: string;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  severity: 'high' | 'medium' | 'low';
}

const SecurityMonitor: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    const fetchSecurityEvents = async () => {
      try {
        const response = await fetch('http://localhost:8877/security/events');
        const data = await response.json();
        setEvents(data.events);
        setAlerts(data.alerts);
      } catch (error) {
        console.error('获取安全事件失败:', error);
      }
    };

    fetchSecurityEvents();
    const interval = setInterval(fetchSecurityEvents, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="security-monitor"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2>安全监控</h2>

      {alerts.map((alert, index) => (
        <Alert
          key={index}
          type="warning"
          message={alert}
          showIcon
        />
      ))}

      <Table
        columns={[
          { title: '类型', key: 'type' },
          { title: '描述', key: 'description' },
          { title: 'IP地址', key: 'ip_address' },
          { title: '时间', key: 'timestamp' },
          { 
            title: '严重程度', 
            key: 'severity',
            render: (severity: string) => (
              <Badge 
                status={
                  severity === 'high' ? 'error' :
                  severity === 'medium' ? 'warning' : 'info'
                }
                text={severity}
              />
            )
          }
        ]}
        dataSource={events}
      />
    </motion.div>
  );
};

export default SecurityMonitor; 