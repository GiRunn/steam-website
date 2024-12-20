import React from 'react';
import './styles.css';

interface TableProps {
  columns: Array<{
    title: string;
    dataIndex: string;
    key: string;
    render?: (text: any, record: any) => React.ReactNode;
  }>;
  dataSource: Array<any>;
  loading?: boolean;
}

const Table: React.FC<TableProps> = ({ columns, dataSource, loading }) => {
  if (loading) {
    return <div className="table-loading">加载中...</div>;
  }

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            {columns.map(column => (
              <th key={column.key}>{column.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataSource.map((record, index) => (
            <tr key={record.key || index}>
              {columns.map(column => (
                <td key={column.key}>
                  {column.render 
                    ? column.render(record[column.dataIndex], record)
                    : record[column.dataIndex]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table; 