// src/pages/Community/PostDetail/components/PostDetail/ReplyList.jsx
// 增强的回复列表组件 - 支持回复嵌套、图片预览、互动动画等功能




import React, { useState, useMemo, memo, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

import { 
  MessageSquare, Flag, Heart, Share2, 
  MoreHorizontal, ChevronDown, ChevronUp, Shield 
} from 'lucide-react';

// 保留原有的组件导入
import CommentReplyEditor from '../CommentReplyEditor';


import mockRepliesData from './mock/replyData';


// 开发环境验证数据
if (process.env.NODE_ENV === 'development') {
  console.log('Loaded mock data:', mockRepliesData);
}

// 新增：第三层评论组件
const ThirdLevelComment = memo(({ comment, onReply, parentId }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);

  const handleReply = useCallback(async (content) => {
    await onReply(parentId, content);
    setShowReplyInput(false);
  }, [onReply, parentId]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="ml-12 mt-4 pl-4 border-l-2 border-gray-700/30"
    >
      <div className="flex gap-3">
        <img
          src={comment.author.avatar}
          alt={comment.author.name}
          className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-700/50"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-blue-400">
              {comment.author.name}
            </span>
            <time className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), {
                locale: zhCN,
                addSuffix: true
              })}
            </time>
          </div>
          <p className="text-sm text-gray-300">{comment.content}</p>
          
          {/* 第三层评论的操作按钮 */}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`text-xs flex items-center gap-1 ${
                isLiked ? 'text-pink-400' : 'text-gray-500 hover:text-pink-400'
              }`}
            >
              <Heart className="w-3 h-3" />
              <span>{comment.likes || 0}</span>
            </button>
            
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="text-xs text-gray-500 hover:text-blue-400 flex items-center gap-1"
            >
              <MessageSquare className="w-3 h-3" />
              <span>回复</span>
            </button>
          </div>

          {/* 第三层评论的回复输入框 */}
          <AnimatePresence>
            {showReplyInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <CommentReplyEditor
                  onSubmit={handleReply}
                  onCancel={() => setShowReplyInput(false)}
                  maxLength={200}
                  placeholder={`回复 @${comment.author.name}`}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
});

// 回复图片预览组件
const ImagePreview = memo(({ images }) => {
  if (!images?.length) return null;
  
  return (
    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
      {images.map((image, index) => (
        <motion.div
          key={index}
          className="relative aspect-video rounded-lg overflow-hidden bg-gray-800/50"
          whileHover={{ scale: 1.02 }}
        >
          <img
            src={image.url}
            alt={image.description || '回复图片'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
      ))}
    </div>
  );
});

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
      ${getBadgeStyle()}
    `}>
      {text}
    </span>
  );
});

// 交互按钮组件
const ActionButton = memo(({ icon: Icon, text, count, active, onClick, color = "blue" }) => (
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

// 回复内容组件
const ReplyContent = memo(({ content, mentions, topics }) => {
  // 处理@提及和#话题标签
  const formattedContent = useMemo(() => {
    let result = content;
    mentions?.forEach(mention => {
      result = result.replace(
        `@${mention.name}`,
        `<span class="text-blue-400 hover:underline cursor-pointer">@${mention.name}</span>`
      );
    });
    topics?.forEach(topic => {
      result = result.replace(
        `#${topic}`,
        `<span class="text-emerald-400 hover:underline cursor-pointer">#${topic}</span>`
      );
    });
    return result;
  }, [content, mentions, topics]);

  return (
    <motion.p
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 1 }}
      className="text-gray-300 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: formattedContent }}
    />
  );
});

// 嵌套回复组件
const NestedReplies = memo(({ replies, parentId, onReply }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAllReplies, setShowAllReplies] = useState(false);

  if (!replies?.length) return null;

  const visibleReplies = showAllReplies ? replies : replies.slice(0, 3);

  return (
    // 添加底部间距 mb-6
    <div className="mt-4 mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 ml-12"
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
            // 添加底部间距 space-y-6
            className="space-y-6"
          >
            {visibleReplies.map(reply => (
              <NestedReply
                key={reply.id}
                reply={reply}
                parentId={parentId}
                onReply={onReply}
              />
            ))}

            {replies.length > 3 && !showAllReplies && (
              // 添加底部和顶部间距 my-4
              <button
                onClick={() => setShowAllReplies(true)}
                className="text-sm text-blue-400 hover:text-blue-300 ml-12 my-4"
              >
                查看更多回复...
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});





// 内联回复编辑器组件
const InlineReplyEditor = memo(({ parentId, onSubmit, onCancel }) => (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: 'auto' }}
    exit={{ opacity: 0, height: 0 }}
    className="mt-4"
  >
    <CommentReplyEditor
      onSubmit={async (content) => {
        await onSubmit(parentId, { content });
        onCancel();
      }}
      onCancel={onCancel}
      replyTo={parentId}
      maxLength={500}
      placeholder="写下你的回复..."
    />
  </motion.div>
));










// 回复项组件

// 主回复组件
const ReplyItem = memo(({ reply }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);

  const handleReplySubmit = useCallback(async (content) => {
    try {
      console.log('提交回复:', content);
      setShowReplyInput(false);
    } catch (error) {
      console.error('回复提交失败:', error);
    }
  }, []);

  return (
    <div className="group hover:bg-gray-800/30 pb-4">
      <div className="p-6 flex gap-4">
        <div className="relative flex-shrink-0">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src={reply.author.avatar}
            alt={reply.author.name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-700/50 hover:ring-blue-500/50 
              transition-all duration-300"
          />
          {reply.author.isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-[#0a0f16]" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-blue-400">{reply.author.name}</span>
              {reply.author.badges?.map((badge, index) => (
                <UserBadge key={index} {...badge} />
              ))}
            </div>
            <time className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(reply.createdAt), {
                locale: zhCN,
                addSuffix: true
              })}
            </time>
          </div>
          
          <p className="mt-2 text-gray-300">{reply.content}</p>
          
          <div className="flex items-center gap-6 mt-4">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`text-sm flex items-center gap-2 ${
                isLiked ? 'text-pink-400' : 'text-gray-500 hover:text-pink-400'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>{reply.likes || 0}</span>
            </button>
            
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="text-sm text-gray-500 hover:text-blue-400 flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>回复</span>
            </button>
          </div>

          {showReplyInput && (
            <div className="mt-4">
              <CommentReplyEditor
                onSubmit={handleReplySubmit}
                onCancel={() => setShowReplyInput(false)}
                maxLength={500}
                placeholder="写下你的回复..."
              />
            </div>
          )}
        </div>
      </div>

      {/* 渲染嵌套回复 */}
      {reply.replies && reply.replies.length > 0 && (
        <NestedReplies
          replies={reply.replies}
          parentId={reply.id}
          onReply={handleReplySubmit}
        />
      )}
    </div>
  );
});




// 二级回复组件
const NestedReply = memo(({ reply, onReply, parentId }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);

  const handleReply = useCallback(async (content) => {
    await onReply(parentId, content);
    setShowReplyInput(false);
  }, [onReply, parentId]);

  return (
    // 添加右侧内边距 pr-6，确保内容不会贴到边上
    <div className="border-l-2 border-gray-700/30 ml-12 pl-4 pr-6 mt-4 pb-4">
      <div className="flex gap-3">
        <img
          src={reply.author.avatar}
          alt={reply.author.name}
          className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-700/50"
        />
        {/* 为内容区域添加最大宽度限制，确保布局合理 */}
        <div className="flex-1 max-w-[calc(100%-3rem)]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-blue-400">
              {reply.author.name}
            </span>
            {reply.author.badges?.map((badge, index) => (
              <UserBadge key={index} {...badge} />
            ))}
            <time className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(reply.createdAt), {
                locale: zhCN,
                addSuffix: true
              })}
            </time>
          </div>
          
          {/* 添加文本换行和适当的宽度控制 */}
          <p className="text-sm text-gray-300 break-words">
            {reply.content}
          </p>
          
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`text-xs flex items-center gap-1 ${
                isLiked ? 'text-pink-400' : 'text-gray-500 hover:text-pink-400'
              }`}
            >
              <Heart className="w-3 h-3" />
              <span>{reply.likes || 0}</span>
            </button>
            
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="text-xs text-gray-500 hover:text-blue-400 flex items-center gap-1"
            >
              <MessageSquare className="w-3 h-3" />
              <span>回复</span>
            </button>
          </div>

          {showReplyInput && (
            <div className="mt-3">
              <CommentReplyEditor
                onSubmit={handleReply}
                onCancel={() => setShowReplyInput(false)}
                maxLength={200}
                placeholder={`回复 @${reply.author.name}`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});





// 回复列表头部
const ListHeader = memo(({ total, sort, onSortChange }) => (
  <div className="px-6 py-4 border-b border-gray-700/50">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-200 
        flex items-center gap-2 font-['SF_Pro_Display']">
        全部回复
        <span className="px-2 py-0.5 text-sm bg-blue-500/20 
          text-blue-400 rounded-full font-['SF_Pro_Text']">
          {total}
        </span>
      </h3>
      
      <select
        value={sort}
        onChange={e => onSortChange(e.target.value)}
        className="bg-gray-700/50 text-gray-300 rounded-lg 
          px-3 py-1.5 text-sm border border-gray-600/50 
          focus:outline-none focus:ring-2 focus:ring-blue-500/50
          transition-all duration-200 font-['SF_Pro_Text']"
      >
        <option value="latest">最新回复</option>
        <option value="earliest">最早回复</option>
        <option value="most_liked">最多点赞</option>
        <option value="most_replied">最多回复</option>
      </select>
    </div>
  </div>
));


// 主列表组件
const ReplyList = () => {
  const [sort, setSort] = useState('latest');
  
  // 使用正确导入的 mockRepliesData
  const sortedReplies = useMemo(() => {
    const list = [...mockRepliesData];
    switch (sort) {
      case 'earliest':
        return list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'most_liked':
        return list.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      case 'most_replied':
        return list.sort((a, b) => (b.replies?.length || 0) - (a.replies?.length || 0));
      default:
        return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, [sort]);

  return (
    <div className="bg-gray-800/30 rounded-xl">
      <div className="px-6 py-4 border-b border-gray-700/50 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-200">
          全部回复
          <span className="ml-2 px-2 py-0.5 text-sm bg-blue-500/20 text-blue-400 rounded-full">
            {sortedReplies.length}
          </span>
        </h3>
        
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-gray-700/50 text-gray-300 rounded-lg px-3 py-1.5 text-sm border border-gray-600/50"
        >
          <option value="latest">最新回复</option>
          <option value="earliest">最早回复</option>
          <option value="most_liked">最多点赞</option>
          <option value="most_replied">最多回复</option>
        </select>
      </div>

      <div className="divide-y divide-gray-700/50">
        {sortedReplies.map((reply) => (
          <ReplyItem key={reply.id} reply={reply} />
        ))}
      </div>

      {sortedReplies.length === 0 && (
        <div className="py-20 text-center text-gray-500">
          暂无回复，快来抢先评论吧
        </div>
      )}
    </div>
  );
};


export default ReplyList;