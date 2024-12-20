import React from 'react';
import './Table.css';

interface Column {
  title: string;
  dataIndex: string;
  key: string;
  render?: (value: any, record: any) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  dataSource: any[];
  loading?: boolean;
}

const Table: React.FC<TableProps> = ({ columns, dataSource, loading = false }) => {
  if (loading) {
    return <div className="table-loading">加载中...</div>;
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataSource.map((record, index) => (
            <tr key={record.key || index}>
              {columns.map((column) => (
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