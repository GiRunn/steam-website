import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { PerformanceDetails as PerformanceDetailsType } from '../../../types';
import './styles.css';

interface PerformanceDetailsProps {
  data: PerformanceDetailsType;
}

const PerformanceDetails: React.FC<PerformanceDetailsProps> = ({ data }) => {
  const connectionData = [
    { name: '活跃连接', value: data.connection_stats.active_connections, color: '#64ffda' },
    { name: '空闲连接', value: data.connection_stats.idle_connections, color: '#4fc3f7' },
    { name: '等待连接', value: data.connection_stats.waiting_connections, color: '#ff5555' }
  ];

  const performanceCards = [
    {
      icon: 'fas fa-clock',
      label: '平均查询时间',
      value: `${data.query_performance.avg_query_time.toFixed(2)}ms`,
      color: '#64ffda'
    },
    {
      icon: 'fas fa-database',
      label: '缓存命中率',
      value: `${data.query_performance.cache_hit_ratio.toFixed(2)}%`,
      color: '#4fc3f7'
    },
    {
      icon: 'fas fa-bolt',
      label: '活跃查询数',
      value: data.query_stats.length,
      color: '#ff5555'
    }
  ];

  return (
    <motion.div 
      className="performance-details glass-effect"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
    >
      <motion.h3 
        className="section-title"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5 }}
      >
        性能详情
      </motion.h3>
      
      <div className="performance-grid">
        {performanceCards.map((card, index) => (
          <motion.div 
            key={index}
            className="performance-card"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            style={{ borderColor: card.color }}
          >
            <div className="card-icon" style={{ color: card.color }}>
              <i className={card.icon}></i>
            </div>
            <div className="card-content">
              <span className="card-label">{card.label}</span>
              <span className="card-value" style={{ color: card.color }}>
                {card.value}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        className="connection-stats"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <h4>连接状态分布</h4>
        <div className="stats-container">
          <div className="pie-chart">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={connectionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {connectionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="stats-legend">
            {connectionData.map((item, index) => (
              <motion.div 
                key={index}
                className="legend-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
              >
                <span className="legend-color" style={{ backgroundColor: item.color }}></span>
                <span className="legend-label">{item.name}</span>
                <span className="legend-value">{item.value}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="query-stats"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <h4>活跃查询</h4>
        <div className="query-list">
          {data.query_stats.map((query, index) => (
            <motion.div 
              key={index}
              className="query-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="query-header">
                <span className="query-duration">
                  {query.duration_ms.toFixed(2)}ms
                </span>
                <span className={`query-status ${query.waiting ? 'waiting' : 'running'}`}>
                  {query.waiting ? '等待中' : '执行中'}
                </span>
              </div>
              <div className="query-content">
                <code>{query.query}</code>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PerformanceDetails; 