import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Statistic, Chart, Icon, Alert } from '../../common';
import { getReviewSystemStats } from '../../../services/monitorService';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getReviewSystemStats();
        if (response.code === 200) {
          setStats(response.data);
        } else {
          throw new Error(response.message || '获取数据失败');
        }
      } catch (error: any) {
        console.error('获取评论统计失败:', error);
        setError(error.message || '获取数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>加载中...</div>;
  if (error) return <Alert type="error" message={error} />;
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
          data={stats.review_distribution}
          xField="date"
          yField="count"
          title="评论趋势"
          type="line"
          height={400}
          color="#1890ff"
        />
      </div>
    </motion.div>
  );
};

export default ReviewSystemMonitor; 