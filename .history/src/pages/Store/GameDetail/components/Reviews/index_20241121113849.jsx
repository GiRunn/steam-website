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

const Reviews = ({ game }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // 评论过滤选项
  const filters = [
    { id: 'all', label: '全部评价' },
    { id: 'positive', label: '好评' },
    { id: 'negative', label: '差评' },
    { id: 'recent', label: '最新' }
  ];

  // 模拟更多评论数据
  const reviews = Array(5).fill(game.reviews).map((review, index) => ({
    id: index + 1,
    author: `玩家${index + 1}`,
    avatar: 'https://picsum.photos/50/50',
    rating: 5,
    playtime: '120.5小时',
    content: '游戏画面精美，剧情引人入胜，值得推荐！游戏画面精美，剧情引人入胜，值得推荐！',
    helpful: 256,
    date: '2024-01-15'
  }));

  return (
    <section className="space-y-8">
      {/* 标题与统计 */}
      <div className="flex items-start justify-between">
        <div>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-white mb-2"
          >
            玩家评价
          </motion.h2>
          <div className="text-gray-400">
            {game.reviews.total.toLocaleString()} 条评价，
            {game.reviews.positive}% 好评率
          </div>
        </div>

        {/* 筛选按钮 */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10
              text-white hover:bg-white/20 transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span>筛选</span>
            <ChevronDown className={`w-5 h-5 transition-transform
              ${showFilters ? 'rotate-180' : ''}`} 
            />
          </motion.button>

          {/* 筛选下拉菜单 */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-48 rounded-xl bg-[#1a1f2e]
                  shadow-xl border border-white/10 overflow-hidden z-20"
              >
                {filters.map((filter)