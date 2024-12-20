import React from 'react';
import { Card, Statistic } from '../../common';
import { useMonitor } from '../../../hooks/useMonitor';
import './styles.css';

const ReviewSystemMonitor = () => {
  const { reviewMetrics, loading } = useMonitor();

  return (
    <Card title="评论系统监控">
      <div className="review-stats">
        <Statistic
          title="总评论数"
          value={reviewMetrics?.totalReviews || 0}
          loading={loading}
        />
        <Statistic
          title="平均评分"
          value={reviewMetrics?.avgRating || 0}
          precision={1}
          loading={loading}
        />
      </div>
    </Card>
  );
};

export default ReviewSystemMonitor; 