import React, { useEffect, useState } from 'react';
import MetricsChart from '../../Charts/MetricsChart';
import { Card, Table, Alert } from '../../common';
import { useMonitor } from '../../../hooks/useMonitor';
import './ReviewSystemMonitor.css';

interface ReviewMetrics {
  total_reviews: number;
  avg_rating: number;
  reviews_last_hour: number;
  unique_games_reviewed: number;
  total_replies: number;
  avg_review_length: number;
}

interface ReviewStats {
  total_reviews: number;
  reviews_today: number;
  active_reviews: number;
  deleted_reviews: number;
  average_rating: number;
  total_replies: number;
  review_distribution: Array<{
    date: string;
    count: number;
  }>;
}

const ReviewSystemMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<ReviewMetrics | null>(null);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { getReviewSystemMetrics, getReviewSystemStats } = useMonitor();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsData, statsData] = await Promise.all([
          getReviewSystemMetrics(),
          getReviewSystemStats()
        ]);
        setMetrics(metricsData);
        setStats(statsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取评论系统数据失败');
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // 每分钟更新一次
    return () => clearInterval(interval);
  }, [getReviewSystemMetrics, getReviewSystemStats]);

  if (error) {
    return <Alert type="error" message={error} />;
  }

  if (!metrics || !stats) {
    return <div className="loading">加载中...</div>;
  }

  const chartData = stats.review_distribution.map(item => ({
    timestamp: item.date,
    value: item.count
  }));

  return (
    <div className="review-system-monitor">
      <div className="metrics-grid">
        <Card title="总评论数">
          <div className="metric-value">{stats.total_reviews}</div>
        </Card>
        <Card title="今日评论">
          <div className="metric-value">{stats.reviews_today}</div>
        </Card>
        <Card title="平均评分">
          <div className="metric-value">{stats.average_rating.toFixed(1)}</div>
        </Card>
        <Card title="活跃评论">
          <div className="metric-value">{stats.active_reviews}</div>
        </Card>
      </div>

      <div className="charts-section">
        <MetricsChart
          data={chartData}
          title="评论趋势"
          color="#1890ff"
          height={300}
        />
      </div>

      <div className="details-section">
        <Card title="评论系统详细指标">
          <Table
            columns={[
              { title: '指标', dataIndex: 'metric', key: 'metric' },
              { title: '数值', dataIndex: 'value', key: 'value' }
            ]}
            dataSource={metrics ? [
              { metric: '每小时新增评论', value: metrics.reviews_last_hour },
              { metric: '被评论游戏数', value: metrics.unique_games_reviewed },
              { metric: '总回复数', value: metrics.total_replies },
              { metric: '平均评论长度', value: `${metrics.avg_review_length} 字符` }
            ] : []}
          />
        </Card>
      </div>
    </div>
  );
};

export default ReviewSystemMonitor; 