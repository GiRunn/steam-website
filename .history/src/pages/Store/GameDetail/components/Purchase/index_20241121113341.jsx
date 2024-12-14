import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Gift, Clock, Users, Share } from 'lucide-react';

const Purchase = ({ game }) => {
  const formatNumber = (num) => new Intl.NumberFormat('zh-CN').format(num);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm"
    >
      {/* 价格区域 */}
      <div className="p-6 space-y-6">
        {/* 折扣信息 */}
        {game.discount > 0 && (
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="px-3 py-1 rounded-full bg-green-500 text-white font-bold"
            >
              -{game.discount}%
            </motion.div>
            <div>
              <div className="text-gray-400 line-through">
                ¥{formatNumber(game.originalPrice)}
              </div>
              <div className="text-3xl font-bold text-white">
                ¥{formatNumber(game.price)}
              </div>
            </div>
          </div>
        )}

        {/* 购买按钮 */}
        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 
              to-purple-600 text-white font-medium flex items-center justify-center 
              gap-2 hover:from-blue-500 hover:to-purple-500 transition-colors group"
          >
            <ShoppingCart className="w-5 h-5 transition-transform group-hover:scale-110" />
            立即购买
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-6 py-3 rounded-xl bg-white/10 text-white font-medium
              flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
          >
            <Gift className="w-5 h-5" />
            添加至愿望清单
          </motion.button>
        </div>

        {/* 游戏信息 */}
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">开发商</span>
            <span className="text-white">{game.publisher}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">发售日期</span>
            <span className="text-white">{game.releaseDate}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">游戏模式</span>
            <span className="text-white">{game.playerCount}</span>
          </div>
        </div>

        {/* 功能标签 */}
        <div className="flex flex-wrap gap-2">
          {game.features.map((feature) => (
            <span
              key={feature}
              className="px-3 py-1 rounded-full text-sm bg-white/10 text-gray-200"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* 底部统计 */}
      <div className="px-6 py-4 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{formatNumber(game.reviews.total)}+ 用户</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>游戏时长 20h+</span>
          </div>
        </div>
        <Share className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white 
          transition-colors" />
      </div>
    </motion.div>
  );
};

export default Purchase;