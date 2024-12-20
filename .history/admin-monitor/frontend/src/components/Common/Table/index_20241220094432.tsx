import React from 'react';
import './Table.css';

interface Column {
  title: string;
  dataIndex: string;
  key: string;
}

interface TableProps {
  columns: Column[];
  dataSource: Record<string, any>[];
}

const Table: React.FC<TableProps> = ({ columns, dataSource = [] }) => {
  const data = Array.isArray(dataSource) ? dataSource : [];

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
          {data.length > 0 ? (
            data.map((record, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={`${index}-${column.key}`}>
                    {record[column.dataIndex]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center' }}>
                暂无数据
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table; 