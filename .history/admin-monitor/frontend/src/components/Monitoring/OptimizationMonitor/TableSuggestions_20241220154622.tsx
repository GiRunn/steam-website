import React from 'react';
import { Table, Progress } from '../../common';

export interface TableSuggestion {
  schemaname: string;
  tablename: string;
  row_count: number;
  dead_tuples: number;
  dead_tuple_ratio: number | null;
}

interface Props {
  suggestions: TableSuggestion[];
}

const TableSuggestions: React.FC<Props> = ({ suggestions }) => {
  return (
    <div className="suggestion-section">
      <h3>表优化建议</h3>
      <Table
        columns={[
          { 
            title: '表名', 
            key: 'tablename', 
            dataIndex: 'tablename',
            render: (text: string) => <span className="table-name">{text}</span>
          },
          { 
            title: '记录数', 
            key: 'row_count', 
            dataIndex: 'row_count' 
          },
          { 
            title: '死元组数', 
            key: 'dead_tuples', 
            dataIndex: 'dead_tuples' 
          },
          {
            title: '死元组率',
            key: 'dead_tuple_ratio',
            dataIndex: 'dead_tuple_ratio',
            render: (ratio: number | null) => {
              if (ratio === null) return '0%';
              return (
                <Progress
                  percent={ratio}
                  status={
                    ratio > 50 ? 'exception' :
                    ratio > 20 ? 'warning' : 'normal'
                  }
                />
              );
            }
          }
        ]}
        dataSource={suggestions}
      />
    </div>
  );
};

export default TableSuggestions; 