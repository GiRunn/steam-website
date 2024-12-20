import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Statistic, Chart } from '../common';
import './styles.css';

interface ReviewStats {
  total_reviews: number;
  reviews_today: number;
  active_reviews: number;
  deleted_reviews: number;
  average_rating: number;
  total_replies: number;
  review_distribution: {
    date: string;
    count: number;
  }[];
}

const ReviewSystemMonitor: React.FC = () => {
  const [stats, setStats] = useState<ReviewStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8877/review-system/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('获取评论统计失败:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  return (
    <motion.div 
      className="review-system-monitor"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2>评论系统监控</h2>
      
      <div className="stats-grid">
        <Card>
          <Statistic 
            title="总评论数"
            value={stats.total_reviews}
            prefix={<Icon type="comment" />}
          />
        </Card>
        
        <Card>
          <Statistic 
            title="今日评论"
            value={stats.reviews_today}
            prefix={<Icon type="rise" />}
          />
        </Card>
        
        <Card>
          <Statistic 
            title="平均评分"
            value={stats.average_rating}
            precision={1}
            prefix={<Icon type="star" />}
          />
        </Card>
      </div>

      <div className="chart-section">
        <Chart
          type="line"
          data={stats.review_distribution}
          xField="date"
          yField="count"
          title="评论趋势"
        />
      </div>
    </motion.div>
  );
};

export default ReviewSystemMonitor; 