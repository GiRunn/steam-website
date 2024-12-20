import React from 'react';
import { Card, Table, Badge } from '../../common';
import { useMonitor } from '../../../hooks/useMonitor';
import './styles.css';

const DatabaseMonitor = () => {
  const { data: databaseMetrics, loading } = useMonitor({ type: 'database' });

  const columns = [
    {
      title: '指标名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '当前值',
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge 
          status={status === 'normal' ? 'success' : 'error'}
          text={status === 'normal' ? '正常' : '异常'}
        />
      ),
    },
  ];

  return (
    <Card title="数据库监控">
      <Table
        columns={columns}
        dataSource={Array.isArray(databaseMetrics) ? databaseMetrics : []}
        loading={loading}
      />
    </Card>
  );
};

export default DatabaseMonitor; 