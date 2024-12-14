import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import {
  ChevronLeft,
  Share,
  Bookmark,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Users,
  Send,
  Calendar,
  Edit,
  Trash,
  MoreVertical,
  MessageSquare,
  Heart
} from 'lucide-react';

const PostDetails = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState('');

  // TODO: 从服务器获取帖子详情数据
  useEffect(() => {
    // 根据 postId 获取帖子详情
    // 设置 post 状态
  }, [postId]);

  if (!post) {
    return <div>加载中...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1e2837] rounded-xl shadow-lg"
      >
        {/* 帖子详情头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-white"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>返回社区</span>
          </motion.button>
          <div className="flex items-center gap-4">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Share className="w-5 h-5 text-gray-400 hover:text-white transition-colors duration-300" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Bookmark className="w-5 h-5 text-gray-400 hover:text-white transition-colors duration-300" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <MoreVertical className="w-5 h-5 text-gray-400 hover:text-white transition-colors duration-300" />
            </motion.button>
          </div>
        </div>

        {/* 帖子详情内容 */}
        <div className="px-6 py-8">
          <h1 className="text-3xl font-bold text-white mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 mb-8">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">{post.author.name}</span>
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="text-lg text-white mb-8">{post.content}</div>

          {/* 帖子操作 */}
          <div className="flex items-center gap-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors duration-300"
            >
              <ThumbsUp className="w-5 h-5" />
              <span>{post.stats.likes}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors duration-300"
            >
              <ThumbsDown className="w-5 h-5" />
              <span>{post.stats.dislikes}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-gray-400 hover:text-orange-400 transition-colors duration-300"
            >
              <Flag className="w-5 h-5" />
              <span>举报</span>
            </motion.button>
          </div>
        </div>

        {/* 评论区 */}
        <div className="px-6 py-8 border-t border-white/10">
          <h2 className="text-xl font-bold text-white mb-4">评论 ({post.stats.comments})</h2>

          {/* 评论输入框 */}
          <div className="flex items-start gap-4 mb-8">
            <img
              src="/api/placeholder/48/48"
              alt="User Avatar"
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="发表你的评论..."
                className="w-full px-4 py-2 bg-[#253447] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end mt-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                >
                  <Send className="w-4 h-4" />
                  <span>发表评论</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* 评论列表 */}
          <div className="space-y-6">
            {post.comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-4"
              >
                <img
                  src={comment.author.avatar}
                  alt={comment.author.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-white">{comment.author.name}</span>
                    <span className="text-sm text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-gray-200">{comment.content}</div>
                  <div className="mt-2 flex items-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors duration-300"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{comment.replyCount}</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors duration-300"
                    >
                      <Heart className="w-4 h-4" />
                      <span>{comment.likeCount}</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PostDetails;