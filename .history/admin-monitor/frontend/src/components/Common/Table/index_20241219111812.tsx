import React from 'react';
import './styles.css';

interface Column {
  title: string;
  key: string;
  render?: (value: any) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  dataSource: any[];
}

const Table: React.FC<TableProps> = ({ columns, dataSource }) => {
  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataSource.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex}>
                  {column.render ? column.render(row[column.key]) : row[column.key]}
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