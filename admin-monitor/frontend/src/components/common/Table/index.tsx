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

const Table: React.FC<TableProps> = ({ columns, dataSource = [], loading }) => {
  if (loading) {
    return (
      <div className="table-loading" role="status" aria-live="polite">
        加载中...
      </div>
    );
  }

  const data = Array.isArray(dataSource) ? dataSource : [];

  return (
    <div className="table-wrapper">
      <table className="table" role="grid">
        <thead>
          <tr role="row">
            {columns.map(column => (
              <th key={column.key} role="columnheader" scope="col">
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr role="row">
              <td 
                colSpan={columns.length} 
                className="table-empty"
                role="cell"
                aria-label="暂无数据"
              >
                暂无数据
              </td>
            </tr>
          ) : (
            data.map((record, index) => (
              <tr key={record.key || index} role="row">
                {columns.map(column => (
                  <td key={column.key} role="cell">
                    {column.render 
                      ? column.render(record[column.dataIndex], record)
                      : record[column.dataIndex]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table; 