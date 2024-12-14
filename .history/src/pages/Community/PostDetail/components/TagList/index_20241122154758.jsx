// src/pages/Community/PostDetail/components/TagList/index.jsx
import React from 'react';
import PropTypes from 'prop-types';

const TagList = ({ 
  tags = [],
  onTagClick,
  maxDisplay = 5,
  size = 'default' // 'small' | 'default' | 'large'
}) => {
  const sizeClasses = {
    small: 'px-2 py-0.5 text-xs',
    default: 'px-3 py-1 text-sm',
    large: 'px-4 py-2 text-base'
  };

  const displayTags = tags.slice(0, maxDisplay);
  const remainingCount = tags.length - maxDisplay;

  return (
    <div className="flex flex-wrap gap-2 mb-4" role="list" aria-label="帖子标签">
      {displayTags.map((tag, index) => (
        <button
          key={`${tag}-${index}`}
          onClick={() => onTagClick?.(tag)}
          className={`
            ${sizeClasses[size]}
            bg-blue-500/20 text-blue-400 rounded-full
            hover:bg-blue-500/30 transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-500/50
          `}
          role="listitem"
        >
          {tag}
        </button>
      ))}
      {remainingCount > 0 && (
        <span className={`
          ${sizeClasses[size]}
          text-gray-400 bg-gray-700/30 rounded-full
        `}>
          +{remainingCount}
        </span>
      )}
    </div>
  );
};

TagList.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string),
  onTagClick: PropTypes.func,
  maxDisplay: PropTypes.number,
  size: PropTypes.oneOf(['small', 'default', 'large'])
};

export default React.memo(TagList);