import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../common/Card';
import { getPartitionStatus } from '../../../services/monitorService';
import './PartitionMonitor.css';

interface PartitionInfo {
  partition_name: string;
  total_size: string;
  used_size: string;
  free_size: string;
  usage_percent: number;
  mount_point: string;
  status: 'healthy' | 'warning' | 'critical';
  io_stats: {
    read_ops: number;
    write_ops: number;
    read_bytes: string;
    write_bytes: string;
  };
}

const PartitionMonitor: React.FC = () => {
  const [partitions, setPartitions] = useState<PartitionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPartition, setSelectedPartition] = useState<string | null>(null);

  useEffect(() => {
    const fetchPartitions = async () => {
      try {
        setLoading(true);
        const response = await getPartitionStatus();
        if (response.success) {
          setPartitions(response.data);
          setError(null);
        } else {
          throw new Error(response.message);
        }
      } catch (err) {
        setError('获取分区状态失败');
        console.error('Error fetching partition status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPartitions();
    const interval = setInterval(fetchPartitions, 30000); // 每30秒更新一次
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return '#f5222d';
      case 'warning': return '#faad14';
      case 'healthy': return '#52c41a';
      default: return '#8c8c8c';
    }
  };

  if (loading) {
    return <div className="partition-loading">加载中...</div>;
  }

  if (error) {
    return <div className="partition-error">{error}</div>;
  }

  return (
    <div className="partition-monitor">
      <Card title="分区监控">
        <div className="partitions-grid">
          {partitions.map((partition) => (
            <motion.div
              key={partition.partition_name}
              className={`partition-card ${selectedPartition === partition.partition_name ? 'selected' : ''}`}
              onClick={() => setSelectedPartition(
                selectedPartition === partition.partition_name ? null : partition.partition_name
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="partition-header">
                <h3>{partition.partition_name}</h3>
                <span 
                  className={`partition-status status-${partition.status}`}
                  style={{ backgroundColor: getStatusColor(partition.status) }}
                >
                  {partition.status}
                </span>
              </div>

              <div className="partition-info">
                <div className="info-item">
                  <span className="info-label">挂载点</span>
                  <span className="info-value">{partition.mount_point}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">总大小</span>
                  <span className="info-value">{partition.total_size}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">已使用</span>
                  <span className="info-value">{partition.used_size}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">剩余空间</span>
                  <span className="info-value">{partition.free_size}</span>
                </div>
              </div>

              <div className="usage-bar">
                <div 
                  className="usage-fill"
                  style={{ 
                    width: `${partition.usage_percent}%`,
                    backgroundColor: getStatusColor(partition.status)
                  }}
                />
                <span className="usage-text">{partition.usage_percent}%</span>
              </div>

              {selectedPartition === partition.partition_name && (
                <motion.div
                  className="io-stats"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <h4>I/O 统计</h4>
                  <div className="io-grid">
                    <div className="io-item">
                      <span className="io-label">读取操作</span>
                      <span className="io-value">{partition.io_stats.read_ops}/s</span>
                    </div>
                    <div className="io-item">
                      <span className="io-label">写入操作</span>
                      <span className="io-value">{partition.io_stats.write_ops}/s</span>
                    </div>
                    <div className="io-item">
                      <span className="io-label">读取数据</span>
                      <span className="io-value">{partition.io_stats.read_bytes}/s</span>
                    </div>
                    <div className="io-item">
                      <span className="io-label">写入数据</span>
                      <span className="io-value">{partition.io_stats.write_bytes}/s</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default PartitionMonitor; 