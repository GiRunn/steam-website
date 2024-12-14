import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import './styles.css';

const Pagination = ({
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // 生成页码数组
  const generatePageNumbers = () => {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  };

  return (
    <div className="pagination-container">
      {/* 分页统计 */}
      <div className="pagination-info">
        显示 {(currentPage - 1) * itemsPerPage + 1} - 
        {Math.min(currentPage * itemsPerPage, totalItems)} 项，
        共 {totalItems} 项
      </div>

      {/* 分页控件 */}
      <div className="pagination-controls">
        {/* 首页按钮 */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="page-btn"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronFirst className="btn-icon" />
        </motion.button>

        {/* 上一页按钮 */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="page-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="btn-icon" />
        </motion.button>

        {/* 页码按钮 */}
        <div className="page-numbers">
          {generatePageNumbers().map(pageNum => (
            <motion.button
              key={pageNum}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`page-number ${
                currentPage === pageNum ? 'active' : ''
              }`}
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </motion.button>
          ))}
        </div>

        {/* 下一页按钮 */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="page-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="btn-icon" />
        </motion.button>

        {/* 末页按钮 */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="page-btn"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronLast className="btn-icon" />
        </motion.button>
      </div>

      {/* 每页显示数量选择器 */}
      <div className="items-per-page">
        <span>每页显示</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="items-select"
        >
          {[12, 24, 36, 48].map(num => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
        <span>项</span>
      </div>
    </div>
  );
};

export default Pagination;