// src/pages/Community/PostDetail/components/ReplyList.jsx
// 增强的回复列表组件 - 支持回复嵌套、图片预览、互动动画等功能




import React, { useState, useMemo, memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Flag, Heart, Share2, 
  MoreHorizontal, Image as ImageIcon,
  ChevronDown, ChevronUp, Shield, X
} from 'lucide-react';

// 修正导入路径，使用相对路径

import CommentReplyEditor from './CommentReplyEditor';

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
const NestedReplies = memo(({ replies, parentId }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!replies?.length) return null;

  return (
    <div className="mt-4 ml-16 space-y-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300"
      >
        {isExpanded ? <ChevronUp /> : <ChevronDown />}
        {replies.length} 条回复
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
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


// 内联回复编辑器组件
const InlineReplyEditor = memo(({ parentId, onSubmit, onCancel }) => (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: 'auto' }}
    exit={{ opacity: 0, height: 0 }}
    className="mt-4"
  >
    <div className="relative">
      <button
        onClick={onCancel}
        className="absolute top-2 right-2 z-10 p-1 text-gray-400 
          hover:text-gray-300 rounded-full hover:bg-gray-700/50"
      >
        <X className="w-5 h-5" />
      </button>
      <ReplyEditor
        onSubmit={async (data) => {
          await onSubmit(parentId, data);
          onCancel();
        }}
        replyTo={parentId}
        maxLength={500}
      />
    </div>
  </motion.div>
));

// 回复项组件
const ReplyItem = memo(({ reply, isNested = false }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);

  const handleReplySubmit = async (parentId, data) => {
    // 处理回复提交逻辑
    console.log('提交回复:', { parentId, data });
    // TODO: 调用API提交回复
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        group transition-colors duration-200
        ${isNested ? 'pl-4 border-l-2 border-gray-700/50' : 'hover:bg-gray-800/30'}
      `}
    >
      <div className="p-6 flex gap-4">
        {/* 用户头像 */}
        <motion.div className="relative flex-shrink-0">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src={reply.author.avatar}
            alt={reply.author.name}
            className="w-12 h-12 rounded-full object-cover 
              ring-2 ring-gray-700/50 hover:ring-blue-500/50 
              transition-all duration-300"
          />
          {reply.author.isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 
              bg-green-500 rounded-full ring-2 ring-[#0a0f16]" />
          )}
        </motion.div>
        
        <div className="flex-1 space-y-3">
          {/* 用户信息和时间 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h4 className="font-semibold text-blue-400 hover:text-blue-300 
                transition-colors cursor-pointer font-['SF_Pro_Display']">
                {reply.author.name}
              </h4>
              {reply.author.badges?.map((badge, index) => (
                <UserBadge key={index} {...badge} />
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              <time className="text-sm text-gray-500 font-medium font-['SF_Pro_Text']">
                {formatDistanceToNow(new Date(reply.createdAt), {
                  locale: zhCN,
                  addSuffix: true
                })}
              </time>
              <button className="text-gray-500 hover:text-gray-400">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* 回复内容 */}
          <motion.div
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            className="text-gray-300 leading-relaxed font-['Inter']"
          >
            <ReplyContent 
              content={reply.content}
              mentions={reply.mentions}
              topics={reply.topics}
            />
            
            {/* 图片预览 */}
            <ImagePreview images={reply.images} />
          </motion.div>

          {/* 交互按钮 */}
          <div className="flex items-center gap-6 pt-2">
            <ActionButton
              icon={Heart}
              text="点赞"
              count={reply.likes}
              active={isLiked}
              onClick={() => setIsLiked(!isLiked)}
              color="pink"
            />

            <ActionButton
              icon={MessageSquare}
              text="回复"
              count={reply.replies?.length}
              onClick={() => setShowReplyInput(!showReplyInput)}
            />

            <ActionButton
              icon={Share2}
              text="分享"
            />

            <ActionButton
              icon={Flag}
              text="举报"
              color="red"
            />

            {reply.author.isAdmin && (
              <ActionButton
                icon={Shield}
                text="管理员"
                color="amber"
              />
            )}
          </div>

          {/* 内联回复编辑器 */}
          <AnimatePresence>
            {showReplyInput && (
              <InlineReplyEditor
                parentId={reply.id}
                onSubmit={handleReplySubmit}
                onCancel={() => setShowReplyInput(false)}
              />
            )}
          </AnimatePresence>

          {/* 嵌套回复 */}
          {!isNested && reply.replies?.length > 0 && (
            <NestedReplies 
              replies={reply.replies}
              parentId={reply.id}
            />
          )}
        </div>
      </div>
    </motion.div>
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
const ReplyList = ({ replies }) => {
  const [sort, setSort] = useState('latest');
  
  // 根据排序方式处理回复列表
  const sortedReplies = useMemo(() => {
    const list = [...replies];
    switch (sort) {
      case 'earliest':
        return list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'most_liked':
        return list.sort((a, b) => b.likes - a.likes);
      case 'most_replied':
        return list.sort((a, b) => (b.replies?.length || 0) - (a.replies?.length || 0));
      default: // latest
        return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, [replies, sort]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-800/30 rounded-xl backdrop-blur-sm shadow-lg"
    >
      <ListHeader 
        total={replies.length}
        sort={sort}
        onSortChange={setSort}
      />

      <div className="divide-y divide-gray-700/50">
        {sortedReplies.map((reply) => (
          <ReplyItem key={reply.id} reply={reply} />
        ))}
      </div>

      {replies.length === 0 && (
        <div className="py-20 text-center text-gray-500">
          暂无回复，快来抢先评论吧
        </div>
      )}
    </motion.div>
  );
};

export default ReplyList;