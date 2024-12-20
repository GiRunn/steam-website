import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../common/Card';
import { getSecurityEvents } from '../../../services/monitorService';
import './SecurityMonitor.css';

interface SecurityEvent {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  source: string;
  status: 'new' | 'investigating' | 'resolved';
  details: {
    ip?: string;
    user?: string;
    action?: string;
    resource?: string;
    [key: string]: any;
  };
}

const SecurityMonitor: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await getSecurityEvents();
        setEvents(data);
        setError(null);
      } catch (err) {
        setError('获取安全事件失败');
        console.error('Error fetching security events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 10000); // 每10秒更新一次
    return () => clearInterval(interval);
  }, []);

  const filteredEvents = events.filter(event => 
    filter === 'all' ? true : event.severity === filter
  );

  const getEventIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return 'ℹ️';
      default: return '•';
    }
  };

  if (loading) {
    return <div className="security-loading">加载中...</div>;
  }

  if (error) {
    return <div className="security-error">{error}</div>;
  }

  return (
    <div className="security-monitor">
      <Card title="安全监控">
        <div className="security-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            全部
          </button>
          <button 
            className={`filter-btn ${filter === 'critical' ? 'active' : ''}`}
            onClick={() => setFilter('critical')}
          >
            严重
          </button>
          <button 
            className={`filter-btn ${filter === 'high' ? 'active' : ''}`}
            onClick={() => setFilter('high')}
          >
            高危
          </button>
          <button 
            className={`filter-btn ${filter === 'medium' ? 'active' : ''}`}
            onClick={() => setFilter('medium')}
          >
            中危
          </button>
          <button 
            className={`filter-btn ${filter === 'low' ? 'active' : ''}`}
            onClick={() => setFilter('low')}
          >
            低危
          </button>
        </div>

        <div className="events-list">
          {filteredEvents.map((event) => (
            <motion.div
              key={event.id}
              className={`event-item severity-${event.severity}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="event-header">
                <span className="event-icon">{getEventIcon(event.severity)}</span>
                <span className="event-type">{event.type}</span>
                <span className={`event-severity severity-${event.severity}`}>
                  {event.severity}
                </span>
                <span className={`event-status status-${event.status}`}>
                  {event.status}
                </span>
              </div>
              
              <p className="event-description">{event.description}</p>
              
              <div className="event-details">
                {event.details.ip && (
                  <div className="detail-item">
                    <span className="detail-label">IP:</span>
                    <span className="detail-value">{event.details.ip}</span>
                  </div>
                )}
                {event.details.user && (
                  <div className="detail-item">
                    <span className="detail-label">用户:</span>
                    <span className="detail-value">{event.details.user}</span>
                  </div>
                )}
                {event.details.resource && (
                  <div className="detail-item">
                    <span className="detail-label">资源:</span>
                    <span className="detail-value">{event.details.resource}</span>
                  </div>
                )}
              </div>

              <div className="event-footer">
                <span className="event-source">{event.source}</span>
                <time className="event-time">
                  {new Date(event.timestamp).toLocaleString()}
                </time>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SecurityMonitor; 