import React from 'react';
import { motion } from 'framer-motion';
import { QueryStats } from '../../../types';
import './styles.css';

interface QueryAnalysisProps {
  queries: QueryStats[];
}

const QueryAnalysis: React.FC<QueryAnalysisProps> = ({ queries }) => {
  return (
    <motion.div 
      className="query-analysis glass-effect"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="section-title">查询性能分析</h3>
      
      <div className="queries-list">
        {queries.map((query, index) => (
          <motion.div 
            key={index}
            className="query-analysis-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="query-header">
              <div className="query-info">
                <span className="query-duration">
                  {query.duration_ms.toFixed(2)}ms
                </span>
                <span className={`query-state ${query.state.toLowerCase()}`}>
                  {query.state}
                </span>
                {query.waiting && (
                  <span className="query-waiting">等待中</span>
                )}
              </div>
              
              {query.rows_affected && (
                <span className="rows-affected">
                  影响行数: {query.rows_affected}
                </span>
              )}
            </div>
            
            <div className="query-content">
              <pre><code>{query.query}</code></pre>
            </div>
            
            {query.query_plan && (
              <motion.div 
                className="query-plan"
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
              >
                <h4>执行计划</h4>
                <pre><code>{query.query_plan}</code></pre>
              </motion.div>
            )}
            
            <div className="query-actions">
              <motion.button 
                className="action-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                分析详情
              </motion.button>
              <motion.button 
                className="action-button secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                终止查询
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default QueryAnalysis; 