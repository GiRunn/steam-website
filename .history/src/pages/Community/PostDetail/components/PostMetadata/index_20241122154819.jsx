// src/pages/Community/PostDetail/components/PostMetadata/index.jsx
import React from 'react';
import { Eye, Clock } from 'lucide-react';
import PropTypes from 'prop-types';

const MetadataItem = ({ icon: Icon, value, label, className = '' }) => (
  <div className={`flex items-center ${className}`}>
    <Icon className="w-4 h-4 mr-1 text-gray-500" />
    <span className="text-gray-400">
      {value} {label}
    </span>
  </div>
);

const PostMetadata = ({
  views,
  lastActive,
  readTime,
  publishTime,
  updateTime,
  className = ''
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-4 mb-4 text-sm ${className}`}>
      <MetadataItem
        icon={Eye}
        value={views.toLocaleString()}
        label="次浏览"
      />
      
      <MetadataItem
        icon={Clock}
        value={readTime}
        label="分钟阅读"
      />
      
      <div className="flex items-center">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
        <span className="text-gray-400">
          最后活跃 {lastActive}
        </span>
      </div>

      {updateTime && updateTime !== publishTime && (
        <div className="text-gray-500 text-sm">
          · 更新于 {updateTime}
        </div>
      )}
    </div>
  );
};

MetadataItem.propTypes = {
  icon: PropTypes.elementType.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
  className: PropTypes.string
};

PostMetadata.propTypes = {
  views: PropTypes.number.isRequired,
  lastActive: PropTypes.string.isRequired,
  readTime: PropTypes.number.isRequired,
  publishTime: PropTypes.string,
  updateTime: PropTypes.string,
  className: PropTypes.string
};

export default React.memo(PostMetadata);