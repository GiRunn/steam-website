import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star,
  ThumbsUp,
  MessageCircle,
  Filter,
  ChevronDown
} from 'lucide-react';

const ReviewCard = ({ review }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-all
      group relative overflow-hidden"
  >
    <div className="relative z-10">
      {/* 用户信息 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-4">
          <motion.img
            whileHover={{ scale: 1.1 }}
            src={review.avatar}
            alt={review.author}
            className="w-12 h-12 rounded-full ring-2 ring-white/10"
          />
          <div>
            <div className="font-medium text-white">{review.author}</div>
            <div className="text-sm text-gray-400">
              游戏时长：{review.playtime}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400 fill-current" />
          <span className="text-white font-medium">{review.rating}</span>
        </div>
      </div>

      {/* 评价内容 */}
      <p className="text-gray-300 mb-4 line-clamp-3">{review.content}</p>

      {/* 操作栏 */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-400">
          {new Date(review.date).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center gap-1 text-gray-400 hover:text-white
              transition-colors"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{review.helpful}</span>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center gap-1 text-gray-400 hover:text-white
              transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>回复</span>
          </motion.button>
        </div>
      </div>
    </div>

    {/* 背景效果 */}
    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 
      to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
  </motion.div>
);

