// src/pages/Community/components/PostList/PostItem.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar,
  ShieldCheck,
  Share,
  Bookmark,
  Hash,
  Eye,
  Heart,
  MessageCircle 
} from 'lucide-react';
import { Tooltip } from '../../../../components/ui/Tooltip';
import { VideoPlayer } from '../../../../components/VideoPlayer';

// 作者信息组件
const AuthorInfo = ({ author }) => (
  <div className="flex items-center gap-3">
    <div className="relative">
      <img
        src={author.avatar}
        alt={author.name}
        className="w-10 h-10 rounded-xl"
      />
      {author.type === 'official' && (
        <Tooltip content="官方认证">
          <div className="absolute -top-1 -right-1">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
        </Tooltip>
      )}
    </div>
    <div>
      <div className="flex items-center gap-2">
        <span className="font-medium text-white">{author.name}</span>
        {author.badge && (
          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-400">
            {author.badge}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Calendar className="w-4 h-4" />
        <span>{new Date(author.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  </div>
);

// 操作按钮组件
const ActionButtons = ({ pinned }) => (
  <div className="flex items-center gap-2">
    {pinned && (
      <span className="px-3 py-1 rounded-full text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white">
        置顶
      </span>
    )}
    <div className="flex items-center gap-2">
      <Tooltip content="分享">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400"
        >
          <Share className="w-4 h-4" />
        </motion.button>
      </Tooltip>
      <Tooltip content="收藏">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400"
        >
          <Bookmark className="w-4 h-4" />
        </motion.button>
      </Tooltip>
    </div>
  </div>
);

// 媒体内容组件
const MediaContent = ({ media }) => {
  if (!media || media.length === 0) return null;
  
  return (
    <div className="mb-4 rounded-xl overflow-hidden">
      <div className="grid grid-cols-2 gap-2">
        {media.map((item, index) => (
          <div
            key={index}
            className="relative aspect-video rounded-lg overflow-hidden"
          >
            {item.type === 'image' ? (
              <img
                src={item.url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <VideoPlayer url={item.url} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 标签组件
const Tags = ({ tags }) => (
  <div className="flex items-center gap-2">
    {tags.map(tag => (
      <span
        key={tag}
        className="px-3 py-1 rounded-full bg-white/5 text-sm text-gray-400 hover:bg-white/10 transition-colors duration-300 cursor-pointer"
      >
        <Hash className="w-4 h-4 inline-block mr-1" />
        {tag}
      </span>
    ))}
  </div>
);

// 统计信息组件
const Statistics = ({ stats }) => (
  <div className="flex items-center gap-4 text-gray-400">
    <Tooltip content="浏览">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="flex items-center gap-1 hover:text-blue-400 transition-colors duration-300"
      >
        <Eye className="w-4 h-4" />
        <span>{stats.views}</span>
      </motion.button>
    </Tooltip>
    <Tooltip content="点赞">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="flex items-center gap-1 hover:text-red-400 transition-colors duration-300"
      >
        <Heart className="w-4 h-4" />
        <span>{stats.likes}</span>
      </motion.button>
    </Tooltip>
    <Tooltip content="评论">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="flex items-center gap-1 hover:text-green-400 transition-colors duration-300"
      >
        <MessageCircle className="w-4 h-4" />
        <span>{stats.comments}</span>
      </motion.button>
    </Tooltip>
  </div>
);

// 主要内容组件
const PostContent = ({ title, content }) => (
  <div className="mb-4">
    <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300 mb-2">
      {title}
    </h2>
    <p className="text-gray-300">{content}</p>
  </div>
);

// 主组件
const PostItem = ({ post }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
            className="bg-[#0f1724] rounded-xl overflow-hidden group hover:bg-[#141d2e] 
                 transition-colors duration-300 cursor-pointer"
            onClick={() => navigate(`/community/post/${post.id}`)}
    >
      <div className="p-6">
        {/* 帖子头部 */}
        <div className="flex items-start justify-between mb-4">
          <AuthorInfo author={post.author} />
          <ActionButtons pinned={post.pinned} />
        </div>

        {/* 帖子内容 */}
        <PostContent title={post.title} content={post.content} />

        {/* 媒体内容 */}
        <MediaContent media={post.media} />

        {/* 标签和统计 */}
        <div className="flex items-center justify-between">
          <Tags tags={post.tags} />
          <Statistics stats={post.stats} />
        </div>
      </div>
    </motion.div>
  );
};

export default PostItem;