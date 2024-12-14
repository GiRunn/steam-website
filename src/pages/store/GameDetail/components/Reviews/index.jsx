import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// 修改后
import { 
    Star,
    ThumbsUp,
    MessageCircle,
    Filter,
    ChevronDown,
    ArrowUpRight  // 添加这个
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
  
    const filters = [
      { id: 'all', label: '全部评价' },
      { id: 'positive', label: '好评' },
      { id: 'negative', label: '差评' },
      { id: 'recent', label: '最新' }
    ];
  
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
        {/* 评价统计卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* 评分卡片 */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600/10 
            to-purple-600/10 backdrop-blur-sm relative group overflow-hidden">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-6xl font-bold text-white mb-2">
                  {game.rating}
                </div>
                <div className="flex items-center gap-1 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.floor(game.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
  
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">好评</span>
                  <span className="text-green-400">{game.reviews.positive}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${game.reviews.positive}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-green-400 to-green-500"
                  />
                </div>
              </div>
            </div>
  
            {/* 背景动画 */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 
              to-purple-600/20 blur-3xl opacity-0 group-hover:opacity-50 
              transition-opacity" />
          </div>
  
          {/* 评价统计 */}
          <div className="p-6 rounded-2xl bg-white/5 flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold text-white mb-2">
                {game.reviews.total.toLocaleString()}
              </div>
              <div className="text-gray-400">总评价数</div>
            </div>
            <MessageCircle className="w-12 h-12 text-blue-400" />
          </div>
        </motion.div>
  
        {/* 筛选栏 */}
        <div className="flex items-center justify-between">
          <div className="space-x-4">
            {filters.map((filter) => (
              <motion.button
                key={filter.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors
                  ${selectedFilter === filter.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:text-white'}`}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>
  
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5
              text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span>写评价</span>
            <ArrowUpRight className="w-4 h-4" />
          </motion.button>
        </div>
  
        {/* 评价列表 */}
        <div className="grid grid-cols-1 gap-6">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
  
        {/* 加载更多 */}
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 rounded-xl bg-white/5 text-gray-400 
              hover:text-white hover:bg-white/10 transition-colors group"
          >
            <span className="flex items-center gap-2">
              加载更多评价
              <ChevronDown className="w-5 h-5 transition-transform 
                group-hover:translate-y-1" />
            </span>
          </motion.button>
        </div>
      </section>
    );
  };
  
  export default Reviews;