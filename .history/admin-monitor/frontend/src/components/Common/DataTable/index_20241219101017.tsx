import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Column } from './types';
import Pagination from '../Pagination';
import './styles.css';

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  sortable?: boolean;
  searchable?: boolean;
  loading?: boolean;
  emptyMessage?: string;
}

const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  pageSize = 10,
  sortable = true,
  searchable = true,
  loading = false,
  emptyMessage = '暂无数据'
}: DataTableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');

  // 处理排序
  const handleSort = (key: keyof T) => {
    if (!sortable) return;
    
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // 过滤和排序数据
  const processedData = useMemo(() => {
    let result = [...data];

    // 搜索过滤
    if (searchTerm) {
      result = result.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // 排序
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof T];
        const bValue = b[sortConfig.key as keyof T];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig]);

  // 分页
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  return (
    <div className="data-table-container glass-effect">
      {searchable && (
        <div className="table-header">
          <motion.div 
            className="search-container"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <input
              type="text"
              placeholder="搜索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <i className="fas fa-search search-icon"></i>
          </motion.div>
        </div>
      )}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <motion.th
                  key={String(column.key)}
                  className={sortable ? 'sortable' : ''}
                  onClick={() => handleSort(column.key as keyof T)}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="th-content">
                    {column.title}
                    {sortable && sortConfig.key === column.key && (
                      <i className={`fas fa-sort-${sortConfig.direction}`}></i>
                    )}
                  </div>
                </motion.th>
              ))}
            </tr>
          </thead>
          <AnimatePresence mode='wait'>
            {loading ? (
              <motion.tbody
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <tr>
                  <td colSpan={columns.length} className="loading-cell">
                    <div className="loading-spinner"></div>
                    加载中...
                  </td>
                </tr>
              </motion.tbody>
            ) : paginatedData.length === 0 ? (
              <motion.tbody
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <tr>
                  <td colSpan={columns.length} className="empty-cell">
                    {emptyMessage}
                  </td>
                </tr>
              </motion.tbody>
            ) : (
              <motion.tbody
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {paginatedData.map((row, rowIndex) => (
                  <motion.tr
                    key={rowIndex}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: rowIndex * 0.05 }}
                    whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.05)' }}
                  >
                    {columns.map((column, colIndex) => (
                      <td key={colIndex}>
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </motion.tbody>
            )}
          </AnimatePresence>
        </table>
      </div>

      {!loading && processedData.length > pageSize && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(processedData.length / pageSize)}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default DataTable; 