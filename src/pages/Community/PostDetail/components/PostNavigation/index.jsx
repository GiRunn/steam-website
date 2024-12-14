// src/pages/Community/PostDetail/components/PostNavigation/index.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PropTypes from 'prop-types';

const NavigationButton = ({ direction, onClick, disabled }) => {
  const isLeft = direction === 'left';
  const Icon = isLeft ? ChevronLeft : ChevronRight;
  
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center p-3 rounded-lg transition-all w-full
        ${disabled 
          ? 'bg-gray-800/20 text-gray-600 cursor-not-allowed' 
          : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white'
        }
        ${isLeft ? 'sm:flex-row' : 'sm:flex-row-reverse'}
      `}
      aria-label={`${isLeft ? '上' : '下'}一篇帖子`}
    >
      <Icon className={`w-6 h-6 ${isLeft ? 'mr-2' : 'ml-2'}`} />
      {isLeft ? '上一篇' : '下一篇'}
    </button>
  );
};

const PostNavigation = ({ prevPost, nextPost }) => {
  const navigate = useNavigate();

  const handleNavigation = (postId) => {
    if (!postId) return;
    navigate(`/community/post/${postId}`);
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="grid grid-cols-2 gap-4 mt-8 border-t border-gray-800/50 pt-6">
      <NavigationButton
        direction="left"
        onClick={() => handleNavigation(prevPost?.id)}
        disabled={!prevPost}
      />
      <NavigationButton
        direction="right"
        onClick={() => handleNavigation(nextPost?.id)}
        disabled={!nextPost}
      />
    </div>
  );
};

NavigationButton.propTypes = {
  direction: PropTypes.oneOf(['left', 'right']).isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

PostNavigation.propTypes = {
  prevPost: PropTypes.shape({
    id: PropTypes.number.isRequired
  }),
  nextPost: PropTypes.shape({
    id: PropTypes.number.isRequired
  })
};

export default React.memo(PostNavigation);