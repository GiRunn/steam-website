// src/pages/Community/PostDetail/components/PostStats/index.jsx
import React from 'react';
import { Eye, ThumbsUp, MessageCircle, Bookmark } from 'lucide-react';
import PropTypes from 'prop-types';

const StatItem = ({ icon: Icon, label, value, color }) => (
  <div className="bg-gray-800/50 rounded-lg p-4 text-center transform hover:scale-105 transition-transform">
    <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
    <div className="text-lg font-semibold">
      {typeof value === 'number' ? value.toLocaleString() : value}
    </div>
    <div className="text-sm text-gray-400">{label}</div>
  </div>
);

const PostStats = ({ stats = {} }) => {
  const items = [
    { icon: Eye, label: '浏览', value: stats.views, color: 'text-blue-400' },
    { icon: ThumbsUp, label: '获赞', value: stats.likes, color: 'text-red-400' },
    { icon: MessageCircle, label: '评论', value: stats.comments, color: 'text-green-400' },
    { icon: Bookmark, label: '收藏', value: stats.bookmarks, color: 'text-yellow-400' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" role="group" aria-label="帖子统计">
      {items.map((item) => (
        <StatItem
          key={item.label}
          icon={item.icon}
          label={item.label}
          value={item.value || 0}
          color={item.color}
        />
      ))}
    </div>
  );
};

StatItem.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.number,
  color: PropTypes.string
};

PostStats.propTypes = {
  stats: PropTypes.shape({
    views: PropTypes.number,
    likes: PropTypes.number,
    comments: PropTypes.number,
    bookmarks: PropTypes.number
  })
};

export default React.memo(PostStats);