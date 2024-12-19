import React from 'react';
import { motion } from 'framer-motion';
import './styles.css';

export interface QueryAnalysisProps {
  queries: {
    id: string;
    query: string;
    duration: number;
    timestamp: string;
    status: 'success' | 'error' | 'running';
  }[];
}

const QueryAnalysis: React.FC<QueryAnalysisProps> = ({ queries }) => {
  return (
    <div className="query-analysis">
      <h2>查询分析</h2>
      <div className="query-list">
        {queries.map((query) => (
          <motion.div 
            key={query.id}
            className={`query-item ${query.status}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="query-header">
              <span className="query-time">{new Date(query.timestamp).toLocaleTimeString()}</span>
              <span className={`query-status ${query.status}`}>{query.status}</span>
            </div>
            <pre className="query-content">{query.query}</pre>
            <div className="query-duration">
              执行时间: {query.duration.toFixed(2)}ms
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default QueryAnalysis; 