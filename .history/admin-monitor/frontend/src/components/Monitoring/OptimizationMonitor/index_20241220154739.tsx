import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TableSuggestions, { TableSuggestion } from './TableSuggestions';
import IndexSuggestions, { IndexSuggestion } from './IndexSuggestions';
import { Progress } from '../../common';
import './styles.css';

interface OptimizationData {
  table_suggestions: TableSuggestion[];
  index_suggestions: IndexSuggestion[];
}

interface APIResponse {
  code: number;
  data: OptimizationData;
  timestamp: string;
}

const OptimizationMonitor: React.FC = () => {
  const [data, setData] = useState<OptimizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const fetchOptimizationSuggestions = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8877/optimization-suggestions');
        const result: APIResponse = await response.json();
        
        if (result.code === 200) {
          setData(result.data);
          setLastUpdated(new Date(result.timestamp).toLocaleString('zh-CN'));
          setError(null);
        } else {
          setError('获取优化建议失败');
        }
      } catch (error) {
        console.error('获取优化建议失败:', error);
        setError('获取数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchOptimizationSuggestions();
    const interval = setInterval(fetchOptimizationSuggestions, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="loading-container">
      <Progress 
        percent={100} 
        status="normal"
        strokeColor={{
          '0%': '#108ee9',
          '100%': '#87d068',
        }}
      />
      <span className="loading-text">加载中...</span>
    </div>
  );
  if (error) return <div className="error-message">{error}</div>;
  if (!data) return null;

  return (
    <motion.div 
      className="optimization-monitor"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="optimization-header">
        <h2>数据库优化建议</h2>
        <span className="last-updated">最后更新: {lastUpdated}</span>
      </div>

      <div className="suggestions-container">
        <TableSuggestions suggestions={data.table_suggestions} />
        <IndexSuggestions suggestions={data.index_suggestions} />
      </div>
    </motion.div>
  );
};

export default OptimizationMonitor; 