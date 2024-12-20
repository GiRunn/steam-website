import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getConnectionStatus } from '../../../services/monitorService';
import './ConnectionDetails.css';

interface ConnectionStats {
  active_connections: number;
  idle_connections: number;
  idle_in_transaction: number;
  waiting_connections: number;
}

const ConnectionDetails: React.FC = () => {
  const [stats, setStats] = useState<ConnectionStats>({
    active_connections: 0,
    idle_connections: 0,
    idle_in_transaction: 0,
    waiting_connections: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getConnectionStatus();
        setStats(data);
        setError(null);
      } catch (err) {
        setError('获取连接详情失败');
        console.error('Error fetching connection stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000); // 每5秒更新一次
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="connection-loading">加载中...</div>;
  }

  if (error) {
    return <div className="connection-error">{error}</div>;
  }

  return (
    <motion.div 
      className="connection-details"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      <div className="stats-grid">
        <div className="stat-item">
          <h4>活跃连接</h4>
          <div className="stat-value">{stats.active_connections}</div>
        </div>
        <div className="stat-item">
          <h4>空闲连接</h4>
          <div className="stat-value">{stats.idle_connections}</div>
        </div>
        <div className="stat-item">
          <h4>事务中空闲</h4>
          <div className="stat-value">{stats.idle_in_transaction}</div>
        </div>
        <div className="stat-item">
          <h4>等待连接</h4>
          <div className="stat-value">{stats.waiting_connections}</div>
        </div>
      </div>
    </motion.div>
  );
};

export default ConnectionDetails; 