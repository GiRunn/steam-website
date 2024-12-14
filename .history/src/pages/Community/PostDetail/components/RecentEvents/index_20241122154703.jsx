// src/pages/Community/PostDetail/components/RecentEvents/index.jsx
import React from 'react';
import { Calendar } from 'lucide-react';
import PropTypes from 'prop-types';
import { MAX_RECENT_EVENTS } from '../../utils/constants';

const EventStatusBadge = ({ status }) => {
  const statusStyles = {
    '报名中': 'bg-green-500/20 text-green-400',
    '即将开始': 'bg-blue-500/20 text-blue-400',
    '进行中': 'bg-yellow-500/20 text-yellow-400',
    '已结束': 'bg-gray-500/20 text-gray-400',
    '准备中': 'bg-purple-500/20 text-purple-400'
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${statusStyles[status] || statusStyles['准备中']}`}>
      {status}
    </span>
  );
};

const RecentEvents = ({ events = [] }) => {
  const defaultEvents = [
    { id: 1, title: '年度玩家大会', date: '2024/12/01', status: '报名中' },
    { id: 2, title: '冬季版本预览', date: '2024/12/15', status: '即将开始' },
    { id: 3, title: '圣诞特别活动', date: '2024/12/24', status: '准备中' }
  ];

  const displayEvents = events.length > 0 ? events : defaultEvents;

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <Calendar className="w-5 h-5 mr-2 text-blue-400" />
        近期活动
      </h3>
      <div className="space-y-4">
        {displayEvents.slice(0, MAX_RECENT_EVENTS).map((event) => (
          <div 
            key={event.id}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/30 transition-colors"
          >
            <div className="flex items-center flex-1 min-w-0">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 flex-shrink-0"></div>
              <div className="overflow-hidden">
                <div className="text-gray-200 truncate">{event.title}</div>
                <div className="text-sm text-gray-500">{event.date}</div>
              </div>
            </div>
            <EventStatusBadge status={event.status} />
          </div>
        ))}
      </div>
    </div>
  );
};

EventStatusBadge.propTypes = {
  status: PropTypes.string.isRequired
};

RecentEvents.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired
    })
  )
};

export default React.memo(RecentEvents);