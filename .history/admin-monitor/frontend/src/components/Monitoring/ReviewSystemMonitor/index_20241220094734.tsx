import React from 'react';
import { motion } from 'framer-motion';
import Alert from '../../common/Alert';
import Statistic from '../../common/Statistic';
import Icon from '../../common/Icon';
import Card from '../../common/Card';
import MetricsChart from '../../Charts/MetricsChart';
import { useMonitor } from '../../../hooks/useMonitor';
import { useMonitorContext } from '../../../context/MonitorContext';
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
  const { refreshInterval } = useMonitorContext();
  const { data: stats, loading, error } = useMonitor<ReviewStats>({
    endpoint: '/review-system/stats',
    interval: refreshInterval,
  });

  if (loading) return <div>加载中...</div>;
  if (error) return <Alert type="error" message={error} />;
  if (!stats) return null;

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