import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../common/Card';
import { getReviewSystemMetrics, getReviewSystemAnomalies } from '../../../services/monitorService';
import './ReviewSystemMonitor.css';

interface ReviewMetrics {
  total_reviews: number;
  avg_rating: number;
  reviews_last_hour: number;
  unique_games_reviewed: number;
  total_replies: number;
  avg_review_length: number;
}

interface Anomaly {
  id: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}

const ReviewSystemMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<ReviewMetrics>({
    total_reviews: 0,
    avg_rating: 0,
    reviews_last_hour: 0,
    unique_games_reviewed: 0,
    total_replies: 0,
    avg_review_length: 0
  });

  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [metricsData, anomaliesData] = await Promise.all([
          getReviewSystemMetrics(),
          getReviewSystemAnomalies()
        ]);
        setMetrics(metricsData);
        setAnomalies(anomaliesData);
        setError(null);
      } catch (err) {
        setError('获取评论系统数据失败');
        console.error('Error fetching review system data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // 每30秒更新一次
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="review-loading">加载中...</div>;
  }

  if (error) {
    return <div className="review-error">{error}</div>;
  }

  return (
    <div className="review-system-monitor">
      <Card title="评论系统监控">
        <div className="metrics-section">
          <motion.div 
            className="metrics-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="metric-item">
              <h3>总评论数</h3>
              <div className="metric-value">{metrics.total_reviews.toLocaleString()}</div>
            </div>
            <div className="metric-item">
              <h3>平均评分</h3>
              <div className="metric-value">{metrics.avg_rating.toFixed(1)}</div>
            </div>
            <div className="metric-item">
              <h3>最近一小时评论</h3>
              <div className="metric-value">{metrics.reviews_last_hour}</div>
            </div>
            <div className="metric-item">
              <h3>已评论游戏数</h3>
              <div className="metric-value">{metrics.unique_games_reviewed.toLocaleString()}</div>
            </div>
            <div className="metric-item">
              <h3>总回复数</h3>
              <div className="metric-value">{metrics.total_replies.toLocaleString()}</div>
            </div>
            <div className="metric-item">
              <h3>平均评论长度</h3>
              <div className="metric-value">{metrics.avg_review_length} 字符</div>
            </div>
          </motion.div>
        </div>

        {anomalies.length > 0 && (
          <div className="anomalies-section">
            <h3>异常检测</h3>
            <div className="anomalies-list">
              {anomalies.map((anomaly) => (
                <motion.div
                  key={anomaly.id}
                  className={`anomaly-item severity-${anomaly.severity}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="anomaly-header">
                    <span className="anomaly-type">{anomaly.type}</span>
                    <span className="anomaly-severity">{anomaly.severity}</span>
                  </div>
                  <p className="anomaly-description">{anomaly.description}</p>
                  <time className="anomaly-time">
                    {new Date(anomaly.timestamp).toLocaleString()}
                  </time>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ReviewSystemMonitor; 