import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Table, Progress } from '../common';
import './styles.css';

interface Partition {
  table_name: string;
  partition_name: string;
  start_date: string;
  end_date: string;
  row_count: number;
  size_bytes: number;
  usage_percent: number;
}

const PartitionMonitor: React.FC = () => {
  const [partitions, setPartitions] = useState<Partition[]>([]);

  useEffect(() => {
    const fetchPartitions = async () => {
      try {
        const response = await fetch('http://localhost:8877/partitions/status');
        const data = await response.json();
        setPartitions(data);
      } catch (error) {
        console.error('获取分区状态失败:', error);
      }
    };

    fetchPartitions();
    const interval = setInterval(fetchPartitions, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="partition-monitor"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2>分区监控</h2>

      <Table
        columns={[
          { title: '表名', key: 'table_name' },
          { title: '分区名', key: 'partition_name' },
          { title: '开始日期', key: 'start_date' },
          { title: '结束日期', key: 'end_date' },
          { title: '记录数', key: 'row_count' },
          { 
            title: '使用率', 
            key: 'usage_percent',
            render: (percent: number) => (
              <Progress 
                percent={percent}
                status={
                  percent > 90 ? 'exception' :
                  percent > 70 ? 'warning' : 'normal'
                }
              />
            )
          }
        ]}
        dataSource={partitions}
      />
    </motion.div>
  );
};

export default PartitionMonitor; 