// src/pages/Community/PostDetail/components/QuickActions/index.jsx
import React from 'react';
import { Share2, Bookmark, Flag } from 'lucide-react';
import PropTypes from 'prop-types';
import { POST_ACTIONS } from '../../utils/constants';

const QuickActions = ({ 
  isBookmarked = false, 
  onShare, 
  onBookmark, 
  onReport,
  disabledActions = []
}) => {
  const handleAction = (action, handler) => {
    if (disabledActions.includes(action)) return;
    if (handler) handler();
  };

  const actions = [
    {
      id: POST_ACTIONS.SHARE,
      icon: Share2,
      label: '分享',
      onClick: () => handleAction(POST_ACTIONS.SHARE, onShare),
      className: 'text-gray-400 hover:text-blue-400'
    },
    {
      id: POST_ACTIONS.BOOKMARK,
      icon: Bookmark,
      label: isBookmarked ? '已收藏' : '收藏',
      onClick: () => handleAction(POST_ACTIONS.BOOKMARK, onBookmark),
      className: isBookmarked ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
    },
    {
      id: POST_ACTIONS.REPORT,
      icon: Flag,
      label: '举报',
      onClick: () => handleAction(POST_ACTIONS.REPORT, onReport),
      className: 'text-gray-400 hover:text-red-400'
    }
  ];

  return (
    <div 
      className="flex items-center justify-end space-x-4 mb-4"
      role="toolbar"
      aria-label="帖子操作"
    >
      {actions.map(({ id, icon: Icon, label, onClick, className }) => (
        <button
          key={id}
          onClick={onClick}
          className={`flex items-center transition-colors ${className} ${
            disabledActions.includes(id) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={disabledActions.includes(id)}
          aria-label={label}
        >
          <Icon className="w-5 h-5 mr-1" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
};

QuickActions.propTypes = {
  isBookmarked: PropTypes.bool,
  onShare: PropTypes.func,
  onBookmark: PropTypes.func,
  onReport: PropTypes.func,
  disabledActions: PropTypes.arrayOf(PropTypes.string)
};

export default React.memo(QuickActions);