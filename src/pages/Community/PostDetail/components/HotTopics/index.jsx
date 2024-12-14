// src/pages/Community/PostDetail/components/HotTopics/index.jsx
import React from 'react';
import { TrendingUp } from 'lucide-react';
import { MAX_HOT_TOPICS } from '../../utils/constants';
import PropTypes from 'prop-types';

const HotTopics = ({ topics = [] }) => {
  // 如果没有传入topics，使用默认数据
  const defaultTopics = [
    { name: '版本更新情报', count: 892 },
    { name: '游戏攻略分享', count: 756 },
    { name: '玩家作品展示', count: 534 },
    { name: '社区活动', count: 421 }
  ];

  const displayTopics = topics.length > 0 ? topics : defaultTopics;

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-red-400" />
        热门话题
      </h3>
      <div className="space-y-3">
        {displayTopics.slice(0, MAX_HOT_TOPICS).map((topic, index) => (
          <div 
            key={topic.name} 
            className="flex items-center justify-between group cursor-pointer"
          >
            <span className="text-gray-300 group-hover:text-blue-400 transition-colors flex items-center">
              <span className="w-5 text-gray-500">#{index + 1}</span>
              {topic.name}
            </span>
            <span className="text-sm text-gray-500">
              {topic.count.toLocaleString()}讨论
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

HotTopics.propTypes = {
  topics: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.required,
      count: PropTypes.number.required
    })
  )
};

export default React.memo(HotTopics);