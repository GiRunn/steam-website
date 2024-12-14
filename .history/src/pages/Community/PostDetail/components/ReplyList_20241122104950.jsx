// src/pages/Community/PostDetail/components/ReplyItem.jsx
// 回复项组件 - 展示单条回复的详细内容，包含用户信息、回复内容、交互功能等

import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { 
  MessageSquare, Flag, Heart, Share2, 
  MoreHorizontal, ChevronDown, ChevronUp,
  Shield
} from 'lucide-react';
import CommentReplyEditor from './CommentReplyEditor';

// 用户徽章组件
const UserBadge = memo(({ type, text }) => {
  const getBadgeStyle = () => {
    switch (type) {
      case 'admin':
        return 'bg-red-500/20 text-red-400';
      case 'moderator':
        return 'bg-purple-500/20 text-purple-400';
      case 'vip':
        return 'bg-amber-500/20 text-amber-400';
      default:
        return 'bg-gray-700/50 text-gray-400';
    }
  };

  return (
    <span className={`
      px-2 py-0.5 text-xs rounded-full
      font-['SF_Pro_Text']
      ${getBadgeStyle()}
    `}>
      {text}
    </span>
  );
});

// 操作按钮组件
const ActionButton = memo(({ 
  icon: Icon, 
  text, 
  count, 
  active, 
  onClick, 
  color = "blue"
}) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`
      flex items-center gap-2 text-sm
      transition-colors duration-200
      ${active 
        ? `text-${color}-400` 
        : `text-gray-500 hover:text-${color}-400`
      }
      font-['SF_Pro_Text']
    `}
  >
    <Icon className="w-4 h-4" />
    <span>{text}</span>
    {count > 0 && (
      <span className={`
        px-1.5 py-0.5 text-xs rounded-full
        ${active ? `bg-${color}-500/20` : 'bg-gray-700/50'}
      `}>
        {count}
      </span>
    )}
  </motion.button>
));

// 图片预览组件
const ImagePreview = memo(({ images }) => {
  if (!images?.length) return null;
  
  return (
    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
      {images.map((image, index) => (
        <motion.div
          key={index}
          className="relative aspect-video rounded-lg overflow-hidden bg-gray-800/50 group"
          whileHover={{ scale: 1.02 }}
        >
          <img
            src={image.url}
            alt={image.description || '回复图片'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent 
            opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
      ))}
    </div>
  );
});

// 嵌套回复组件
const NestedReplies = memo(({ replies, parentId }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!replies?.length) return null;

  return (
    <div className="mt-4 ml-16">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-gray-400 
          hover:text-gray-300 font-['SF_Pro_Text']"
      >
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {replies.length} 条回复
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 mt-4"
          >
            {replies.map(reply => (
              <ReplyItem 
                key={reply.id} 
                reply={reply}
                isNested={true}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// 主回复项组件
const ReplyItem = memo(({ reply, isNested = false }) => {
  // 1. Hooks声明
  const [isLiked, setIsLiked] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showMore, setShowMore] = useState(false);

  // 2. 数据验证
  if (!reply) {
    console.warn('ReplyItem: reply prop is required');
    return null;
  }

  // 3. 数据默认值处理
  const {
    id = '',
    author = {
      name: '未知用户',
      avatar: '/default-avatar.png', 
      isOnline: false,
      badges: [],
      isAdmin: false
    },
    content = '',
    createdAt = new Date(),
    likes = 0,
    images = [],
    replies = []
  } = reply;

  // 4. 事件处理函数
  const handleReplySubmit = async (content) => {
    try {
      console.log('提交回复:', { parentId: id, content });
    } catch (error) {
      console.error('回复提交失败:', error);
    }
  };

  // 5. 渲染UI
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        group rounded-lg transition-colors duration-200 relative
        ${isNested 
          ? 'pl-4 border-l-2 border-gray-700/50' 
          : 'hover:bg-gray-800/30'
        }
      `}
    >
      <div className="p-6 flex gap-4">
        {/* 用户头像区域 */}
        <motion.div className="relative flex-shrink-0">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src={author.avatar}
            alt={author.name}
            className="w-12 h-12 rounded-full object-cover 
              ring-2 ring-gray-700/50 hover:ring-blue-500/50 
              transition-all duration-300"
            onError={(e) => {
              e.target.src = '/default-avatar.png';
            }}
          />
          {author.isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 
              bg-green-500 rounded-full ring-2 ring-[#0a0f16]" />
          )}
        </motion.div>
        
        {/* 回复内容区域 */}
        <div className="flex-1 min-w-0">
          {/* 用户信息和时间栏 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-wrap">
              <h4 className="font-semibold text-blue-400 hover:text-blue-300 
                transition-colors cursor-pointer font-['SF_Pro_Display']">
                {author.name}
              </h4>
              {author.badges?.map((badge, index) => (
                <UserBadge key={index} {...badge} />
              ))}
            </div>
            
            {/* 时间和更多操作 */}
            <div className="flex items-center gap-3">
              <time className="text-sm text-gray-500 font-medium font-['SF_Pro_Text']">
                {formatDistanceToNow(new Date(createdAt), {
                  locale: zhCN,
                  addSuffix: true
                })}
              </time>
              
              {/* 更多操作按钮 */}
              <div className="relative">
                <button 
                  onClick={() => setShowMore(!showMore)}
                  className="p-1 text-gray-500 hover:text-gray-300 rounded-lg
                    hover:bg-gray-700/50 transition-all duration-200"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                
                {/* 更多操作下拉菜单 */}
                <AnimatePresence>
                  {showMore && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 py-2
                        bg-[#1a1f2e] rounded-lg shadow-xl border border-gray-700/50
                        z-50"
                    >
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          setShowMore(false);
                        }}
                        className="w-full px-4 py-2 text-sm text-gray-300
                          hover:bg-gray-700/50 text-left font-['SF_Pro_Text']
                          flex items-center gap-2"
                      >
                        <Share2 className="w-4 h-4" />
                        复制链接
                      </button>
                      <button
                        onClick={() => {
                          // TODO: 实现举报功能
                          setShowMore(false);
                        }}
                        className="w-full px-4 py-2 text-sm text-red-400
                          hover:bg-gray-700/50 text-left font-['SF_Pro_Text']
                          flex items-center gap-2"
                      >
                        <Flag className="w-4 h-4" />
                        举报
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          
          {/* 回复内容 */}
          <div className="mt-2">
            <p className="text-gray-300 leading-relaxed break-words font-['Inter']">
              {content}
            </p>
            
            {/* 图片预览 */}
            <ImagePreview images={images} />
          </div>

          {/* 操作按钮组 */}
          <div className="flex items-center gap-6 mt-4">
            <ActionButton
              icon={Heart}
              text="点赞"
              count={likes}
              active={isLiked}
              onClick={() => setIsLiked(!isLiked)}
              color="pink"
            />

            <ActionButton
              icon={MessageSquare}
              text="回复"
              count={replies?.length}
              onClick={() => setShowReplyInput(!showReplyInput)}
            />

            <ActionButton
              icon={Share2}
              text="分享"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
              }}
            />

            {author.isAdmin && (
              <ActionButton
                icon={Shield}
                text="管理员"
                color="amber"
              />
            )}
          </div>

          {/* 回复编辑器 */}
          <AnimatePresence>
            {showReplyInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <CommentReplyEditor
                  replyTo={author.name}
                  onSubmit={handleReplySubmit}
                  onCancel={() => setShowReplyInput(false)}
                  maxLength={500}
                  placeholder={`回复 @${author.name}...`}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 嵌套回复 */}
          {!isNested && replies?.length > 0 && (
            <NestedReplies 
              replies={replies}
              parentId={id}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
});

export default ReplyItem;

