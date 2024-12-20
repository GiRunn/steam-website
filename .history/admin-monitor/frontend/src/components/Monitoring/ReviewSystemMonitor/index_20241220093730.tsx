import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Alert from '../../common/Alert';
import Statistic from '../../common/Statistic';
import Icon from '../../common/Icon';
import Card from '../../common/Card';
import MetricsChart, { MetricsChartProps } from '../../Charts/MetricsChart';
import './ReviewSystemMonitor.css';

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
        const response = await fetch(`${process.env.REACT_APP_API_URL}/review-system/stats`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('获取评论统计失败:', error);
        setError('获取数据失败，请稍后重试');
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

  // 转换数据格式以匹配 MetricsChart 的要求
  const chartData = stats.review_distribution.map(item => ({
    timestamp: item.date,
    value: item.count
  }));

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
        <MetricsChart
          data={chartData}
          title="评论趋势"
          height={400}
          color="#1890ff"
        />
      </div>
    </motion.div>
  );
};

export default ReviewSystemMonitor; 