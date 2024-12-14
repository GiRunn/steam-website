// src/pages/Community/PostDetail/components/CommunityActivities/index.jsx
import React from 'react';
import { Activity } from 'lucide-react';
import PropTypes from 'prop-types';

const ActivityBadge = ({ type }) => {
  const badgeStyles = {
    活动: 'bg-blue-500/20 text-blue-400',
    公告: 'bg-green-500/20 text-green-400',
    更新: 'bg-purple-500/20 text-purple-400',
    比赛: 'bg-yellow-500/20 text-yellow-400'
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full mr-2 ${badgeStyles[type] || badgeStyles['活动']}`}>
      {type}
    </span>
  );
};

const CommunityActivities = ({ activities = [] }) => {
  // 默认活动数据
  const defaultActivities = [
    { type: '活动', title: '每周截图分享活动', time: '2小时前', id: 1 },
    { type: '公告', title: '社区规范更新提醒', time: '4小时前', id: 2 },
    { type: '活动', title: '玩家创作大赛开始报名', time: '1天前', id: 3 },
    { type: '更新', title: '游戏版本更新公告', time: '2天前', id: 4 }
  ];

  const displayActivities = activities.length > 0 ? activities : defaultActivities;

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-purple-400" />
        社区动态
      </h3>
      <div className="space-y-4">
        {displayActivities.map((activity) => (
          <div 
            key={activity.id}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/30 transition-all cursor-pointer"
          >
            <div className="flex-1 min-w-0"> {/* 防止长文本溢出 */}
              <ActivityBadge type={activity.type} />
              <span className="text-gray-300 hover:text-blue-400 transition-colors truncate inline-block max-w-[calc(100%-80px)]">
                {activity.title}
              </span>
            </div>
            <span className="text-sm text-gray-500 flex-shrink-0 ml-2">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

ActivityBadge.propTypes = {
  type: PropTypes.string.isRequired
};

CommunityActivities.propTypes = {
  activities: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired
    })
  )
};

export default React.memo(CommunityActivities);