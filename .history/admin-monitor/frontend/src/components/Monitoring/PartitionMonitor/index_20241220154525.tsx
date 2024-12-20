import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Table, Progress, Badge } from '../../common';
import './styles.css';

interface Partition {
  table_name: string;
  partition_name: string;
  size: string;
  size_bytes: number;
  row_count: number;
  dead_tuples: number;
  dead_tuple_percent: number;
  last_vacuum: string | null;
  last_analyze: string | null;
  status: 'healthy' | 'needs_vacuum' | 'large_partition';
}

interface APIResponse {
  code: number;
  data: Partition[];
  message: string;
}

const PartitionMonitor: React.FC = () => {
  const [partitions, setPartitions] = useState<Partition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPartitions = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8877/partitions/status');
        const result: APIResponse = await response.json();
        
        if (result.code === 200) {
          setPartitions(result.data);
          setError(null);
        } else {
          setError(result.message || '获取分区数据失败');
        }
      } catch (error) {
        console.error('获取分区状态失败:', error);
        setError('获取分区数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchPartitions();
    const interval = setInterval(fetchPartitions, 60000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      healthy: { status: 'success', text: '健康' },
      needs_vacuum: { status: 'warning', text: '需要清理' },
      large_partition: { status: 'error', text: '分区过大' }
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || { status: 'default', text: '未知' };
    return <Badge status={statusInfo.status as any} text={statusInfo.text} />;
  };

  const formatDate = (date: string | null) => {
    if (!date) return '未执行';
    return new Date(date).toLocaleString('zh-CN');
  };

  return (
    <motion.div 
      className="partition-monitor"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2>分区监控</h2>
      
      {loading && <div className="loading">加载中...</div>}
      {error && <div className="error">{error}</div>}
      
      {!loading && !error && (
        <Table
          columns={[
            { title: '表名', key: 'table_name', dataIndex: 'table_name' },
            { title: '分区名', key: 'partition_name', dataIndex: 'partition_name' },
            { title: '大小', key: 'size', dataIndex: 'size' },
            { title: '记录数', key: 'row_count', dataIndex: 'row_count' },
            { 
              title: '死元组率', 
              key: 'dead_tuple_percent',
              dataIndex: 'dead_tuple_percent',
              render: (percent: number) => (
                <Progress 
                  percent={percent}
                  status={
                    percent > 20 ? 'exception' :
                    percent > 10 ? 'warning' : 'normal'
                  }
                />
              )
            },
            { 
              title: '最后清理时间', 
              key: 'last_vacuum', 
              dataIndex: 'last_vacuum',
              render: formatDate
            },
            { 
              title: '最后分析时间', 
              key: 'last_analyze', 
              dataIndex: 'last_analyze',
              render: formatDate
            },
            { 
              title: '状态', 
              key: 'status',
              dataIndex: 'status',
              render: getStatusBadge
            }
          ]}
          dataSource={partitions}
        />
      )}
    </motion.div>
  );
};

export default PartitionMonitor; 