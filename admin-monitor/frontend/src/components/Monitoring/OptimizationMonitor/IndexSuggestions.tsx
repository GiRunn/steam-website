import React from 'react';
import { Table, Badge } from '../../common';

export interface IndexSuggestion {
  schemaname: string;
  tablename: string;
  indexname: string;
  idx_scan: number;
  idx_tup_read: number;
  idx_tup_fetch: number;
  suggestion: string;
}

interface Props {
  suggestions: IndexSuggestion[];
}

const IndexSuggestions: React.FC<Props> = ({ suggestions }) => {
  const getSuggestionBadge = (suggestion: string) => {
    const statusMap: Record<string, { status: string; text: string }> = {
      'Unused index': { status: 'error', text: '未使用' },
      'Index might be redundant': { status: 'warning', text: '可能冗余' },
      'Index is being used': { status: 'success', text: '使用中' }
    };

    const status = statusMap[suggestion] || { status: 'default', text: suggestion };
    return <Badge status={status.status as any} text={status.text} />;
  };

  return (
    <div className="suggestion-section">
      <h3>索引优化建议</h3>
      <Table
        columns={[
          { 
            title: '表名', 
            key: 'tablename', 
            dataIndex: 'tablename',
            render: (text: string) => <span className="table-name">{text}</span>
          },
          { 
            title: '索引名', 
            key: 'indexname', 
            dataIndex: 'indexname' 
          },
          { 
            title: '扫描次数', 
            key: 'idx_scan', 
            dataIndex: 'idx_scan' 
          },
          { 
            title: '读取行数', 
            key: 'idx_tup_read', 
            dataIndex: 'idx_tup_read' 
          },
          {
            title: '建议',
            key: 'suggestion',
            dataIndex: 'suggestion',
            render: getSuggestionBadge
          }
        ]}
        dataSource={suggestions}
      />
    </div>
  );
};

export default IndexSuggestions; 